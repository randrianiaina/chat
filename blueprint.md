# Project Blueprint

## Overview

This document outlines the features and design of the real-time chat application. The application allows users to sign in, create conversations, and chat with each other in real-time. It also includes features like typing indicators and user presence.

## Features

*   **User Authentication:** Users can sign in using their Google or other social accounts via Clerk.
*   **Real-time Chat:** Messages are sent and received in real-time using Firestore.
*   **Conversations:** Users can create and switch between different chat conversations.
*   **Typing Indicators:** Users can see when another user is typing a message.
*   **User Presence:** Users can see whether other users are online or offline.
*   **Tipping:** Users can send tips to each other using Stripe.

## Design

*   **Modern UI:** The application features a modern and visually appealing design with a dark theme.
*   **Responsive Layout:** The layout is responsive and works well on both desktop and mobile devices.
*   **Interactive Elements:** The UI includes interactive elements like buttons, input fields, and presence indicators to enhance the user experience.

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

## Current Plan: Message Reactions

### Overview

This plan outlines the implementation of a message reaction feature that allows users to react to messages with emojis. The feature will be implemented using Firestore to store and sync reactions in real-time.

### Steps

1.  **Reaction Button:** Add a "react" button to each message in the chat UI.
2.  **Emoji Picker:** Display an emoji picker when the "react" button is clicked.
3.  **Save Reaction:** Save the selected reaction to Firestore, associating it with the message.
4.  **Display Reactions:** Display the reactions on each message, showing the emojis and the count of each reaction.
5.  **Real-time Updates:** Ensure that reactions are updated in real-time for all users in the conversation.
