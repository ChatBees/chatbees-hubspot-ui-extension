export interface Ref {
  doc_name: string; // url
  page_num: number;
  sample_text: string;
}

export interface QuestionAnswer {
  answer: string;
  refs: Ref[];
  request_id: string;
  conversation_id: string;
}

export interface ConversationItem {
  question: string;
  response?: QuestionAnswer;
}
