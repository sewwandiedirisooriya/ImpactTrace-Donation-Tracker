// app/(tabs)/ai-insights.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Sample quick action buttons
const QUICK_ACTIONS = [
  { id: '1', text: 'Show donation trends', icon: 'trending-up' },
  { id: '2', text: 'Project recommendations', icon: 'bulb' },
  { id: '3', text: 'Impact analysis', icon: 'analytics' },
  { id: '4', text: 'Beneficiary insights', icon: 'people' },
];

// Sample AI responses
const AI_RESPONSES: { [key: string]: string } = {
  default: "I'm your AI assistant for NGO insights. I can help you with donation trends, project recommendations, impact analysis, and beneficiary insights. What would you like to know?",
  donation: "📊 Based on recent data:\n\n• Education projects: 45% of total donations\n• Healthcare: 30%\n• Community development: 25%\n\n💰 Average donation increased by 15% this quarter!\n\n🎯 Top performing project: Rural Education Initiative ($25,000 raised)",
  project: "🌟 Recommended Projects for You:\n\n1. **Rural Education Initiative**\n   • Impact: 500+ students\n   • Progress: 75% funded\n   • Location: Rural communities\n\n2. **Healthcare Access Program**\n   • Impact: 300+ families\n   • Progress: 60% funded\n   • Focus: Primary healthcare\n\nThese align with high-impact areas and have strong beneficiary engagement rates.",
  impact: "🎯 Your Impact Summary:\n\n👥 Beneficiaries Helped: 1,250+\n📚 Projects Supported: 8 active projects\n\n**Performance Metrics:**\n• Education: 85% completion rate\n• Healthcare: 500+ individuals served\n• Community: 12 initiatives launched\n\n💚 You're making a real difference!",
  beneficiary: "📈 Beneficiary Insights:\n\n**Geographic Distribution:**\n• Rural areas: 60%\n• Urban centers: 40%\n\n**Age Demographics:**\n• Children (0-17): 35%\n• Adults (18-59): 40%\n• Elderly (60+): 25%\n\n**Primary Needs:**\n1. Education: 45%\n2. Healthcare: 35%\n3. Livelihood: 20%",
  greeting: "Hello! 👋 I'm your AI assistant specialized in NGO insights and analytics. I can help you understand:\n\n✨ Donation patterns and trends\n💡 Smart project recommendations\n📊 Impact metrics and analysis\n👥 Beneficiary demographics\n\nHow can I assist you today?",
};

export default function AIInsightsScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: AI_RESPONSES.greeting,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Dismiss keyboard
    Keyboard.dismiss();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simulate AI typing
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = getAIResponse(messageText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return AI_RESPONSES.greeting;
    } else if (lowerMessage.includes('donation') || lowerMessage.includes('trend') || lowerMessage.includes('money')) {
      return AI_RESPONSES.donation;
    } else if (lowerMessage.includes('project') || lowerMessage.includes('recommend')) {
      return AI_RESPONSES.project;
    } else if (lowerMessage.includes('impact') || lowerMessage.includes('effect') || lowerMessage.includes('result')) {
      return AI_RESPONSES.impact;
    } else if (lowerMessage.includes('beneficiary') || lowerMessage.includes('beneficiaries') || lowerMessage.includes('people')) {
      return AI_RESPONSES.beneficiary;
    } else {
      return AI_RESPONSES.default;
    }
  };

  const handleQuickAction = (actionText: string) => {
    handleSend(actionText);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={28} color="#fff" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>AI Insights Assistant</Text>
              <Text style={styles.headerSubtitle}>Powered by AI • Always Learning</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Ionicons name="chatbubbles-outline" size={16} color="#fff" />
            <Text style={styles.statText}>{messages.length} messages</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="bulb-outline" size={16} color="#fff" />
            <Text style={styles.statText}>Smart Analytics</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={() => handleQuickAction(action.text)}
              >
                <Ionicons name={action.icon as any} size={20} color="#0288d1" />
                <Text style={styles.quickActionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userMessage : styles.aiMessage,
            ]}
          >
            {message.sender === 'ai' && (
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={16} color="#fff" />
              </View>
            )}
            <View style={styles.messageContent}>
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                ]}
              >
                {message.text}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  message.sender === 'user' ? styles.userTimestamp : styles.aiTimestamp,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageBubble, styles.aiMessage]}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={16} color="#fff" />
            </View>
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about your NGO..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? '#fff' : '#ccc'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0288d1',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  headerTop: {
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e3f2fd',
    fontWeight: '500',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#e3f2fd',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  quickActionsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  quickActionText: {
    fontSize: 13,
    color: '#0288d1',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0288d1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageContent: {
    maxWidth: '75%',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    padding: 12,
    borderRadius: 16,
  },
  userMessageText: {
    backgroundColor: '#0288d1',
    color: '#fff',
    borderBottomRightRadius: 4,
  },
  aiMessageText: {
    backgroundColor: '#fff',
    color: '#333',
    borderBottomLeftRadius: 4,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  userTimestamp: {
    color: '#666',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#999',
    textAlign: 'left',
  },
  typingIndicator: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0288d1',
    opacity: 0.6,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0288d1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
});