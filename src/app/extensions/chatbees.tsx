import React, { useEffect } from "react";
import {
  Divider,
  Link,
  Button,
  Text,
  Input,
  Flex,
  hubspot,
} from "@hubspot/ui-extensions";

const ChatBeesComponent = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.chatbees.ai/embed.js";
    script.setAttribute("aid", "WELM90Y4");
    script.setAttribute("colname", "ng-doc");
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <Text>hi there</Text>
    </>
  );
};

export default ChatBeesComponent;
