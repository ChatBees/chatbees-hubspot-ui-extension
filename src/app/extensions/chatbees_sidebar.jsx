import React, { useState } from "react";
import {
  Divider,
  Link,
  Button,
  Box,
  Text,
  Input,
  Flex,
  hubspot,
} from "@hubspot/ui-extensions";
import { ChatBeesLogo } from "./chatbees_logo.jsx";
import ChatBeesComponent from "./chatbees";

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
  />
));

// Define the Extension component, taking in runServerless, context, & sendAlert as props
const Extension = ({ context, runServerless, sendAlert, openIframe }) => {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");

  // Call serverless function to execute with parameters.
  // The `myFunc` function name is configured inside `serverless.json`
  const handleClick = async () => {
    const { response } = await runServerless({
      name: "chatbees",
      parameters: { msg: text, text },
    });
    sendAlert({ message: response });
    setResponse(response);
  };

  return (
    <>
      <ChatBeesLogo />
      <Text>
        <Text format={{ fontWeight: "bold" }}>Chat bees are working here!</Text>
        Congratulations, {context.user.firstName}! You just deployed your first
        HubSpot UI extension. This example demonstrates how you would send
        parameters from your React frontend to the serverless function and get a
        response back.
      </Text>

      <Text>Chatbee says:</Text>
      <Text>{response}</Text>
      <Divider />
      <Flex direction="row" align="end" gap="small">
        <Input name="text" label="Send" onInput={(t) => setText(t)} />
        <Button type="submit" onClick={handleClick}>
          Click me
        </Button>
      </Flex>
      <Divider />
      <Text>
        What now? Explore all available{" "}
        <Link href="https://developers.hubspot.com/docs/platform/ui-extension-components">
          UI components
        </Link>
        , get an overview of{" "}
        <Link href="https://developers.hubspot.com/docs/platform/ui-extensions-overview">
          UI extensions
        </Link>
        , learn how to{" "}
        <Link href="https://developers.hubspot.com/docs/platform/create-ui-extensions">
          add a new custom card
        </Link>
        , jump right in with our{" "}
        <Link href="https://developers.hubspot.com/docs/platform/ui-extensions-quickstart">
          Quickstart Guide
        </Link>
        , or check out our{" "}
        <Link href="https://github.com/HubSpot/ui-extensions-react-examples">
          code Samples
        </Link>
        .
      </Text>
    </>
  );
};
