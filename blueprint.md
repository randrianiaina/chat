# Project Blueprint

## Overview

This document outlines the features and design of the real-time chat application. The application allows users to sign in, create conversations, and chat with each other in real-time. It also includes features like typing indicators, user presence, tipping, message reactions, and message editing/deleting.

## Features

*   **User Authentication:** Users can sign in using their Google or other social accounts via Clerk.
*   **Real-time Chat:** Messages are sent and received in real-time using Firestore.
*   **Conversations:** Users can create and switch between different chat conversations.
*   **Typing Indicators:** Users can see when another user is typing a message.
*   **User Presence:** Users can see whether other users are online or offline.
*   **Tipping:** Users can send tips to each other using Stripe.
*   **Message Reactions:** Users can react to messages with emojis, and the reactions are updated in real-time.
*   **Edit/Delete Messages:** Users can edit or delete their own messages.

## Design

*   **Modern UI:** The application features a modern and visually appealing design with a dark theme.
*   **Responsive Layout:** The layout is responsive and works well on both desktop and mobile devices.
*   **Interactive Elements:** The UI includes interactive elements like buttons, input fields, and presence indicators to enhance the user experience.

## Completed: Debugging Conversation Creation

### Overview

This plan documents the process of debugging and fixing a critical issue where authenticated users were unable to create or view conversations. The issue involved a cascade of configuration problems, runtime errors, and build errors.

### Steps

1.  **Fix Configuration:** Moved hardcoded Firebase credentials from `src/lib/firebase.ts` to environment variables in `.env.local` to resolve warnings and improve security.
2.  **Fix Runtime Error:** Identified and fixed a JavaScript error on the chat page (`/app/chat/page.tsx`). The code was trying to access a `creatorId` property that doesn't exist on conversation objects, which blocked rendering. The UI element causing the error was removed.
3.  **Fix Build Errors:**
    *   Resolved a `duplicate export` error in `src/lib/firebase.ts` where `db` was exported twice.
    *   Corrected the database connection imports in `src/app/actions.ts` to match the fix.
    *   Installed multiple missing npm packages (`@neondatabase/serverless`, `date-fns`, `react-icons`) that were causing `Module not found` build errors.

## Completed: Tipping Feature

### Overview

This plan outlines the implementation of a tipping feature that allows users to send money to each other in the chat. The feature has been implemented using Stripe for secure payment processing.

### Steps

1.  **Install Stripe:** Add the `stripe` package to the project.
2.  **Tip Button:** Add a "tip" button to each message in the chat UI.
3.  **API Endpoint:** Create an API endpoint to handle the creation of a Stripe Checkout session.
4.  **Stripe Checkout:** Redirect users to the Stripe Checkout page to complete the payment.
5.  **Success and Cancel Pages:** Create pages to handle successful and canceled payments.
6.  **UI Feedback:** Provide visual feedback in the UI after a successful tip.

## Completed: Message Reactions

### Overview

This plan outlines the implementation of a message reaction feature that allows users to react to messages with emojis. The feature has been implemented using Firestore to store and sync reactions in real-time.

### Steps

1.  **Reaction Button:** Add a "react" button to each message in the chat UI.
2.  **Emoji Picker:** Display an emoji picker when the "react" button is clicked.
3.  **Save Reaction:** Save the selected reaction to Firestore, associating it with the message.
4.  **Display Reactions:** Display the reactions on each message, showing the emojis and the count of each reaction.
5.  **Real-time Updates:** Ensure that reactions are updated in real-time for all users in the conversation.

## Completed: Edit and Delete Messages

### Overview

This plan outlines the implementation of message editing and deletion features. Users can edit the content of their own messages or delete them entirely.

### Steps

1.  **Edit/Delete Buttons:** Add "Edit" and "Delete" buttons to each message belonging to the current user.
2.  **Editing UI:** Create a user interface for editing message content, such as displaying an input field with the current message content.
3.  **Server Actions:** Create server actions (`updateMessage` and `deleteMessage`) to handle updating and deleting messages in Firestore.
4.  **Delete Confirmation:** Implement a confirmation before deleting a message to prevent accidental deletions.
5.  **Real-time Updates:** Ensure that edited and deleted messages are updated in real-time for all users in the conversation.
