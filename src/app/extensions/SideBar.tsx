import {
  Accordion,
  Box,
  Button,
  ErrorState,
  Flex,
  Link,
  List,
  LoadingSpinner,
  Text,
  TextArea,
  hubspot,
} from "@hubspot/ui-extensions";
import React, { useEffect, useState } from "react";
import ChatBeesLogo from "./common/Logo";
import {
  AskQuestionExecutionResult,
  ConversationItem,
} from "./common/chatbeesInterfaces";

// Define the extension to be run within the Hubspot CRM
hubspot.extend<"crm.record.sidebar">(({ runServerlessFunction }) => (
  <Extension runServerlessFunction={runServerlessFunction} />
));

const Extension = ({ runServerlessFunction }) => {
  const [initializing, setInitializing] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [conversationId, setConversationId] = useState(null);

  const initialize = () => {
    setInitializing(true);

    runServerlessFunction({
      name: "checkSecrets",
    }).then(({ response }) => {
      setInitializing(false);
      setInitialized(response);
    });
  };

  useEffect(initialize, []);

  const askQuestion = async () => {
    setConversation([{ question }, ...conversation]);
    setQuestion("");

    setThinking(true);

    const { response }: AskQuestionExecutionResult =
      await runServerlessFunction({
        name: "askQuestion",
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
    <LoadingSpinner label="Loading" showLabel={true} size="medium" />
  ) : (
    <>
      <ChatBeesLogo />

      {initialized ? (
        <Flex direction="column" gap="small">
          <Flex justify="between">
            <Text format={{ fontWeight: "bold" }}>
              Chat bees are working here!
            </Text>
          </Flex>
          <TextArea
            name="question"
            label={""}
            placeholder="Ask me anything..."
            value={question}
            rows={5}
            resize="none"
            required={true}
            onInput={setQuestion}
          />
          <Button
            disabled={!question || thinking}
            variant="primary"
            size="small"
            type="submit"
            onClick={askQuestion}
          >
            Send
          </Button>
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
                  <List variant="unordered">
                    {response.refs.map(({ doc_name }) => (
                      <Link key={doc_name} href={doc_name}>
                        {doc_name}
                      </Link>
                    ))}
                  </List>
                </>
              ) : (
                <LoadingSpinner label="Bees are thinking..." showLabel={true} />
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
