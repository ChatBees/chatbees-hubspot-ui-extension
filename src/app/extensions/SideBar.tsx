import {
  Accordion,
  Button,
  ErrorState,
  ExtensionPointApi,
  Flex,
  Link,
  List,
  LoadingSpinner,
  ServerlessExecutionStatus,
  Text,
  TextArea,
  hubspot,
} from "@hubspot/ui-extensions";
import React, { useEffect, useState } from "react";
import ChatBeesLogo from "./common/Logo";
import { ConversationItem, QuestionAnswer } from "./common/chatbeesInterfaces";

// Define the extension to be run within the Hubspot CRM
hubspot.extend<"crm.record.sidebar">(({ runServerlessFunction, actions }) => (
  <Extension runServerlessFunction={runServerlessFunction} actions={actions} />
));

const Extension = ({
  runServerlessFunction,
  actions: { addAlert },
}: Partial<ExtensionPointApi<"crm.record.sidebar">>) => {
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
    }).then((result) => {
      setInitializing(false);

      if (result.status === ServerlessExecutionStatus.Success) {
        setInitialized(result.response as boolean);
      }
    });
  };

  useEffect(initialize, []);

  const askQuestion = async () => {
    setConversation([{ question }, ...conversation]);
    setQuestion("");

    setThinking(true);

    const result = await runServerlessFunction({
      name: "askQuestion",
      parameters: { question, conversationId },
    });

    setThinking(false);

    if (result.status === ServerlessExecutionStatus.Error) {
      addAlert({
        type: "danger",
        message: result.message,
        title: `ChatBees failed to answer your question "${question}"`,
      });

      // Clear the thinking conversation item
      setConversation(conversation.filter(({ response }) => !!response));

      return;
    }

    const response = result.response as unknown as QuestionAnswer;
    setConversationId(response?.conversation_id);
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
            disabled={!question.replace(/\s/g, "") || thinking}
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
