import React, { useRef } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from '../constant/colors';
import { useNavigation } from '@react-navigation/native';

const DATA = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

const HEADER_MAX_HEIGHT = 240;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const ScrollViewScreen = () => {
  const navigation = useNavigation();
  const scrollOffsetY = useRef(new Animated.Value(0)).current;

  // Animate the main header
  const headerHeight = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  // Animate the header content opacity
  const headerContentOpacity = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Animate the sticky header opacity
  const stickyHeaderOpacity = scrollOffsetY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181D31" />
      
      {/* Main Animated Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            height: headerHeight,
          }
        ]}
      >
        {/* Collapsible Content */}
        <Animated.View 
          style={[
            styles.headerContent,
            { opacity: headerContentOpacity }
          ]}
        >
          <TouchableOpacity 
            onPress={() => Alert.alert("Notification")}
            style={styles.headerButton}
          >
            <Icon name="bell" size={60} color={colors.blue[900]} />
            <Text style={styles.headerButtonText}>Click Me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=> navigation.navigate("ERIS")}>
            <Text className="text-white text-lg">Back na</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Sticky Header Content */}
        <Animated.View 
          style={[
            styles.stickyHeader,
            { opacity: stickyHeaderOpacity }
          ]}
        >
          <View style={styles.stickyHeaderContent}>
            <TouchableOpacity onPress={() => navigation.navigate("ERIS")}>
              <Icon name="menu" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.stickyHeaderTitle}>Your App Title</Text>
            <TouchableOpacity onPress={() => Alert.alert("Settings")}>
              <Icon name="cog" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Main ScrollView Content */}
      <ScrollView
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={styles.scrollContent}
      >
        {DATA.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardText}>({item.id})</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#181D31',
    zIndex: 1000,
    elevation: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  headerButton: {
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 24,
    marginTop: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  stickyHeader: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
  },
  stickyHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  stickyHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT + 10,
    paddingBottom: 20,
  },
  card: {
    height: 100,
    backgroundColor: '#E6DDC4',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    color: '#181D31',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ScrollViewScreen;