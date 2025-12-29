const outlookQuestions = [
  {
    text: "How do you create a new email in Microsoft Outlook?",
    options: [
      { text: 'Click on "New Email" in the ribbon', isCorrect: true },
      { text: 'Press "Ctrl + N"', isCorrect: false },
      { text: 'Press "Alt + F4"', isCorrect: false },
      { text: 'Click on "File" and select "New"', isCorrect: false },
    ],
  },
  {
    text: "Which of the following is the default view for reading emails in Outlook?",
    options: [
      { text: "Mail View", isCorrect: true },
      { text: "Calendar View", isCorrect: false },
      { text: "Contacts View", isCorrect: false },
      { text: "Tasks View", isCorrect: false },
    ],
  },
  {
    text: "How can you schedule an email to be sent later in Outlook?",
    options: [
      {
        text: 'Use the "Delay Delivery" option in the message options',
        isCorrect: true,
      },
      { text: "Set a reminder for the email", isCorrect: false },
      {
        text: 'Click "Send Later" after composing the email',
        isCorrect: false,
      },
      {
        text: "Save the email as a draft and send it manually later",
        isCorrect: false,
      },
    ],
  },
  {
    text: 'What is the purpose of the "Reply All" option in Outlook?',
    options: [
      {
        text: "To reply to the sender and all other recipients",
        isCorrect: true,
      },
      { text: "To reply to the sender only", isCorrect: false },
      { text: "To forward the email to another recipient", isCorrect: false },
      {
        text: "To send a new email to everyone in the contact list",
        isCorrect: false,
      },
    ],
  },
  {
    text: 'What is the function of the "Focused Inbox" in Outlook?',
    options: [
      {
        text: "To show only emails from your most trusted contacts",
        isCorrect: true,
      },
      { text: "To sort emails by importance", isCorrect: false },
      { text: "To prioritize important emails", isCorrect: false },
      { text: "To show only unread emails", isCorrect: false },
    ],
  },
];

module.exports = outlookQuestions;
