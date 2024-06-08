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
import ChatBeesComponent from "./chatbees";

import ChatBeesLogo from "./common/Logo";
// Define the extension to be run within the Hubspot CRM
hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
    openIframe={actions.openIframeModal}
  />
));

// Define the Extension component, taking in runServerless, context, & sendAlert as props
const Extension = ({ context, runServerless, sendAlert, openIframe }) => {
  const [text, setText] = useState("");

  const openChat = () => {
    openIframe({
      uri: "http://localhost:3001/chatbees_demo.html", // this is a relative link. Some links will be blocked since they don't allow iframing
      height: 1000,
      width: 1000,
      title: "Wikipedia in an iframe",
      flush: true,
    });
  };

  // Call serverless function to execute with parameters.
  // The `myFunc` function name is configured inside `serverless.json`
  const handleClick = async () => {
    const { response } = await runServerless({
      name: "myFunc",
      parameters: { text: text },
    });
    sendAlert({ message: response });
  };

  return (
    <>
      <ChatBeesLogo />
      <Box>
        <Button type="submit" onClick={openChat}>
          Open ChatBees
        </Button>
      </Box>
      <Text>
        <Text format={{ fontWeight: "bold" }}>Chat bees are working here!</Text>
        Congratulations, {context.user.firstName}! You just deployed your first
        HubSpot UI extension. This example demonstrates how you would send
        parameters from your React frontend to the serverless function and get a
        response back.
      </Text>

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
