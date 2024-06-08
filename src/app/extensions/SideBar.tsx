import {
  Accordion,
  Box,
  Button,
  ErrorState,
  Flex,
  Link,
  LoadingSpinner,
  Text,
  TextArea,
  hubspot,
} from '@hubspot/ui-extensions';
import React, { useEffect, useState } from 'react';
import ChatBeesLogo from './common/Logo';
import { AskQuestionExecutionResult, ConversationItem } from './common/chatbeesInterfaces';

// Define the extension to be run within the Hubspot CRM
hubspot.extend<'crm.record.sidebar'>(({ runServerlessFunction }) => (
  <Extension runServerlessFunction={runServerlessFunction}/>
));

const Extension = ({ runServerlessFunction }) => {
  const [ initializing, setInitializing ] = useState(true);
  const [ initialized, setInitialized ] = useState(false);
  const [ question, setQuestion ] = useState('');
  const [ thinking, setThinking ] = useState(false);
  const [ conversation, setConversation ] = useState<ConversationItem[]>([]);
  const [ conversationId, setConversationId ] = useState(null);

  const initialize = () => {
    setInitializing(true);

    runServerlessFunction({
      name: 'checkSecrets',
    }).then(({ response }) => {
      setInitializing(false);
      setInitialized(response);
    });
  };

  useEffect(initialize, []);

  const askQuestion = async () => {
    setConversation([ { question }, ...conversation ]);
    setQuestion('');

    setThinking(true);

    const { response }: AskQuestionExecutionResult =
      await runServerlessFunction({
        name: 'askQuestion',
        parameters: { question, conversationId },
      });

    setThinking(false);

    setConversationId(response.conversation_id);
    setConversation([
      { question, response },
      ...conversation.filter(({ response }) => !!response),
    ]);
  };

  return initializing ? (
    <LoadingSpinner label="Loading" showLabel={true} size="medium"/>
  ) : (
    <>
      <ChatBeesLogo/>

      {initialized ? (
        <Flex direction="column" gap="small">
          <Text format={{ fontWeight: 'bold' }}>
            Chat bees are working here!
          </Text>
          <Flex direction="row" gap="small">
            <Box flex={1}>
              <TextArea
                name="question"
                label={''}
                placeholder="Ask me anything..."
                value={question}
                rows={5}
                resize="none"
                required={true}
                onInput={setQuestion}
              />
            </Box>
            <Button
              disabled={!question || thinking}
              variant="primary"
              onClick={askQuestion}
            >
              Send
            </Button>
          </Flex>
          {conversation.map(({ question, response }) => (
            <Accordion
              key={response?.request_id}
              title={question}
              size="sm"
              defaultOpen={true}
            >
              {response ? (
                <>
                  <Text>{response.answer}</Text>
                  <Flex direction="column" gap="small">
                    {response.refs.map((ref, j) => (
                      <Link key={j} href={ref.doc_name}>
                        {ref.doc_name}
                      </Link>
                    ))}
                  </Flex>
                </>
              ) : (
                <LoadingSpinner label="Bees are thinking..." showLabel={true}/>
              )}
            </Accordion>
          ))}
        </Flex>
      ) : (
        <ErrorState title="ChatBees not initialized." type="lock">
          <Text>Please contact your administrator to initialize ChatBees.</Text>
          <Button onClick={initialize}>Try again</Button>
        </ErrorState>
      )}
    </>
  );
};
