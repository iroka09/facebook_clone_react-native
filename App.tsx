
import React, { useState, useEffect, useRef, type ComponentProps } from 'react';
import { ScrollView, View, Image, Text, StyleSheet, Alert, TextInput, Pressable, RefreshControl, Animated, TouchableHighlight, AppState, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getPastTime } from "./libs/normalise_date"
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { NewsDataResponse, UserData } from "./data_cache/data_types"
import * as LocalAuthentication from "expo-local-authentication"
const data = require("./data_cache/data.json") as unknown as {
  "fetched_news": NewsDataResponse,
  "fetched_users": UserData["documents"]
}
import * as Notifications from "expo-notifications";

// Configure how notifications behave when app is foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: "max"
  }),
});

function Notify() {
  const showNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hello Ntomchukwu 👋",
        body: "This shows even if you minimize the app!",
      },
      trigger: null, // send immediately
    });
  };

  return (
    <View>
      <Button title="Show Toast-like Notification" onPress={showNotification} />
    </View>
  );
}


let x = 0
let y = 0
export default function FingerPrint() {
  const [appState, setAppState] = useState(AppState.currentState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authFunCalled = useRef(false)

  const authenticate = async () => {
    //authFunCalled.current = false
    // Check if hardware supports biometrics
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return Alert.alert("Error", "Biometric authentication not supported");
    }

    // Check if user has enrolled biometrics (fingerprint/FaceID)
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      return Alert.alert("Error", "No fingerprints/FaceID found");
    }

    // Authenticate
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Login with fingerprint`,
      fallbackLabel: "Enter password",
      disableDeviceFallback: true, // true = no PIN/password fallback
    });
    if (result.success) setIsAuthenticated(true);
    else {
      setIsAuthenticated(false);
      Alert.alert("Failed", "Authentication failed");
    }
  }
  useEffect(() => {
    if (y === 0) authenticate();
    y++
  }, []);
  // Detect when app returns from background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // If user comes back to app
      if (appState.match(/inactive|background/) && nextAppState === "active" && x === 0) {
        x++
        setIsAuthenticated(false)
        console.log(++x, nextAppState)
        authenticate();
      }
      setAppState(nextAppState);
    });
    return () => {
      subscription.remove();
      x = 0
    }
  }, [appState]);

alert(isAuthenticated)
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isAuthenticated ? (
        <>
          <App />
          <Notify />
        </>
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundaColor: "#0c5", color: "white" }}>
          <Pressable onPress={authenticate}>
            <Text>Login with Fingerprint</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>);
}




const AnimatedPressable = Animated.createAnimatedComponent(Pressable);


type PressedIconBackgroundColorProps = ComponentProps<typeof Ionicons>


function PressedIconBackgroundColor({ name, activeBackroundColor, inactiveBackroundColor, datas: { scrollY }, ...props }: {
  activeBackroundColor: string,
  inactiveBackroundColor: string
} & PressedIconBackgroundColorProps) {
  return (
    <AnimatedPressable
      onPress={() => alert(name + "::")}
      style={{
        transform: (name === "menu") ? [
          {
            translateY: scrollY.interpolate({
              inputRange: [0, 200],
              outputRange: [0, 15],
              extrapolate: "clamp"
            })
          }
        ] : [
          {
            translateX: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 200],
              extrapolate: "clamp"
            })
          },
          {
            rotate: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: ["0deg", "360deg"],
              extrapolate: "clamp"
            })
          }
        ],
        opacity: (name === "menu") ?
          undefined : scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [1, 0],
            extrapolate: "clamp"
          })
      }}
    >
      {({ pressed }) => {
        const backgroundColor = pressed ? activeBackroundColor : inactiveBackroundColor
        if (Array.isArray(props.style))
          props.style = [...props.style, { backgroundColor }]
        else
          props.style = { ...props.style, backgroundColor }
        return (
          <Ionicons
            color="#000"
            name={name}
            {...props}
            style={props.style}
          />
        )
      }}
    </AnimatedPressable>
  )
}


function App() {
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false); // stop spinner after 2s
    }, 2000);
  };
  return (
    <>
      {/*HEADER*/}
      <FingerPrint />
      <View
        style={[
          styles.mainPaddingHorizontal,
          {
            flexDirection: "row",
          }
        ]}
      >
        <Animated.View
          style={{
            flex: 1,
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 200],
                  outputRange: [0, 15],
                  extrapolate: "clamp"
                })
              },
              {
                translateX: scrollY.interpolate({
                  inputRange: [0, 200],
                  outputRange: [0, 30],
                  extrapolate: "clamp"
                }),
              },
              {
                scale: scrollY.interpolate({
                  inputRange: [0, 200],
                  outputRange: [1, 1.3],
                  extrapolate: "clamp"
                }),
              }
            ]
          }}>
          <Text style={[styles.blueColor, { fontSize: 30, fontWeight: 600, }]}>
            facebook
          </Text>
        </Animated.View>
        <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center" }}>
          <PressedIconBackgroundColor style={styles.headerIcons} name="add" size={24} activeBackroundColor='#aaa' inactiveBackroundColor='#ddd' datas={{ scrollY }} />
          <PressedIconBackgroundColor style={[styles.headerIcons, styles.headerIconsGap]} name="search" size={24} activeBackroundColor='#aaa' inactiveBackroundColor='#ddd' datas={{ scrollY }} />
          <PressedIconBackgroundColor style={[styles.headerIcons, styles.headerIconsGap]} name="menu" size={24} activeBackroundColor='#aaa' inactiveBackroundColor='#ddd' datas={{ scrollY }} />
        </View>
      </View>
      {/*ICONS NAV*/}
      <Animated.View
        style={[
          styles.nav,
          {
            transform: [{
              scaleY: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0],
                extrapolate: "clamp"
              })
            }]
          }]}>
        {[
          ["home", Octicons, 24],
          ["people", MaterialIcons, 30],
          ["messenger", Fontisto, 24],
          ["television-play", MaterialCommunityIcons, 24],
          ["bell", Feather, 24],
          ["shop", AntDesign, 24]
        ].map(([name, Icon, size]: any[]) => (
          <Icon
            key={name}
            style={styles.headerIconsGap}
            name={name}
            color="#555"
            size={size}
          />
        ))}
      </Animated.View>

      <Animated.ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event([
          {
            nativeEvent: {
              contentOffset: { y: scrollY }
            }
          }
        ], // map scroll Y
          { useNativeDriver: true } // offload to native thread
        )}
        style={{
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 200],
              outputRange: [0, -30],
              extrapolate: "clamp"
            })
          }]
        }}
      >
        {/*Publish a post*/}
        <View style={styles.publishMessage}>
          {/*  <Image style={{ width: 50, height: 50, borderRadius: 999, borderWidth: 2, }} source={require("./assets/favicon.png")} />*/}
          <Image style={{ width: 50, height: 50, borderRadius: 999, borderWidth: 2, }} source={{ uri: "https://picsum.photos/seed/reels-user1/100" }} />
          <TextInput
            style={{ flex: 1, marginLeft: 8, fontSize: 16, borderRadius: 999, paddingHorizontal: 20, backgroundColor: "rgba(100,100,100,0.15)" }}
            placeholder="what's on your mind?"
            placeholderTextColor="#222"
          />
          <View style={{ alignItems: "center", marginLeft: 8 }}>
            <FontAwesome name='image' size={30} color="#0a4" />
            <Text style={{ marginTop: 4 }}>Image</Text>
          </View>
        </View>

        {/*status*/}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            paddingVertical: 10,
            //backgroundColor: "blue",
          }}
          style={{
            flexGrow: 0 //important
          }}
        >
          {data.fetched_users.map((user) => (
            <View
              key={user.username}
              style={{ position: "relative", width: 120, height: 200, marginLeft: 5, borderRadius: 10, overflow: "hidden", marginVertical: 0 }}
            >
              <Image source={{ uri: user.picture.large }} style={{ width: "100%", height: "100%" }} />
              <LinearGradient
                colors={[
                  "transparent",
                  "transparent",
                  "#000b",
                ]}
                style={StyleSheet.absoluteFillObject}
              />
              <Text
                style={{
                  position: "absolute",
                  insetInline: 5,
                  bottom: 5,
                  fontSize: 20,
                  color: "white",
                  fontWeight: 500,
                  textTransform: "capitalize"
                }}
              >
                {user.name.first + " " + user.name.last}
              </Text>
            </View>
          ))}
        </ScrollView >

        {/*news feeds*/}
        <View style={styles.container}>
          {data.fetched_news.results.map((news) => (
            <View
              key={news.article_id}
              style={{
                paddingVertical: 10,
                borderBottomWidth: 2,
                borderBottomColor: "#bbb",
              }}>
              <View style={[styles.mainPaddingHorizontal, { flexDirection: "row", alignItems: "center", paddingTop: 0 }]}>
                <Image source={{ uri: news.source_icon }} style={{ width: 50, height: 50, borderRadius: 50, borderWidth: 2, borderColor: "#aaa" }} />
                <View style={{ marginLeft: 5 }}>
                  <Text style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>{news.source_name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text>{getPastTime(news.pubDate)}</Text>
                    <Text>•</Text>
                    <Ionicons name="globe" size={15} color="#222" />
                  </View>
                </View>
                <View style={{ flexDirection: "row", marginLeft: "auto" }}>
                  <SimpleLineIcons name="options" size={24} color="#333" style={{ marginRight: 15 }} />
                  <Ionicons name="close" size={24} color="#333" />
                </View>
              </View>
              <View style={[styles.mainPaddingHorizontal, { marginVertical: 5 }]}>
                <Text>
                  {news.description}
                </Text>
              </View>
              <View>
                <Image source={{ uri: news.image_url }} style={{ width: "100%", height: 200 }} />
              </View>
              <View></View>
              <View></View>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </>);
};


const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  publishMessage: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1.5,
    borderBottomColor: "#ccc",
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.6,
    borderBottomColor: "#bbb",
    overflow: "hidden",
  },
  mainPaddingHorizontal: {
    paddingHorizontal: 15
  },
  blueColor: {
    color: "#0088ff"
  },
  headerIcons: {
    borderRadius: 999,
    backgroundColor: "#dddddd",
    padding: 8,
  },
  headerIconsGap: {
    marginLeft: 10
  }
});