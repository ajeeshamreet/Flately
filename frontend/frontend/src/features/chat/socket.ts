// @ts-nocheck
import { io } from "socket.io-client";
import { runtimeConfig } from '@/config/runtimeConfig';

const socketEvents = {
	incomingCanonical: 'message',
	incomingAlias: 'new_message',
	joinCanonical: 'joinRoom',
	sendCanonical: 'sendMessage',
} as const;

export const socket = io(runtimeConfig.socketUrl);

function normalizeIncomingMessage(rawMessage) {
	const createdAt = rawMessage?.createdAt || rawMessage?.timestamp || new Date().toISOString();

	return {
		...rawMessage,
		createdAt,
		timestamp: rawMessage?.timestamp || createdAt,
	};
}

export function joinConversationRoom(conversationId) {
	socket.emit(socketEvents.joinCanonical, conversationId);
}

export function sendConversationMessage(payload) {
	socket.emit(socketEvents.sendCanonical, payload);
}

export function subscribeToIncomingMessages(handler) {
	const recentMessageIds = new Set();

	const onIncoming = (rawMessage) => {
		const normalized = normalizeIncomingMessage(rawMessage);
		const dedupeKey = normalized?.id;

		if (dedupeKey && recentMessageIds.has(dedupeKey)) {
			return;
		}

		if (dedupeKey) {
			recentMessageIds.add(dedupeKey);
			if (recentMessageIds.size > 200) {
				const oldest = recentMessageIds.values().next().value;
				recentMessageIds.delete(oldest);
			}
		}

		handler(normalized);
	};

	socket.on(socketEvents.incomingCanonical, onIncoming);
	socket.on(socketEvents.incomingAlias, onIncoming);

	return () => {
		socket.off(socketEvents.incomingCanonical, onIncoming);
		socket.off(socketEvents.incomingAlias, onIncoming);
	};
}

