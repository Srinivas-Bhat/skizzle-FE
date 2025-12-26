import Button from "@/components/Button";
import ConversationItem from "@/components/ConversationItem";
import Loading from "@/components/Loading";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import { getConversations, newConversation, newMessage } from "@/socket/socketEvents";
import { ConversationProps, ResponseProps } from "@/types";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const Home = () => {
  const { user: currentUser, signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationProps[]>([]);
  const router = useRouter();


  let directConversations = conversations.filter((item: ConversationProps) => item.type == 'direct').sort((a: ConversationProps, b: ConversationProps) => {
    const aDate = a?.lastMessage?.createdAt || a.createdAt;
    const bDate = b?.lastMessage?.createdAt || b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  })

  let groupConversations = conversations.filter((item: ConversationProps) => item.type == 'group').sort((a: ConversationProps, b: ConversationProps) => {
    const aDate = a?.lastMessage?.createdAt || a.createdAt;
    const bDate = b?.lastMessage?.createdAt || b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();

  })

  const handleLogout = async () => {
    await signOut();
  };

  const processConversations = async (res: ResponseProps) => {
    console.log("Res: ", res);

    if(res.success) {
      setConversations(res.data); 
    }
  };

  const newConversationHandler = (res: ResponseProps) => {
    if(res.success && res.data?.isNew) {
      setConversations((prev) => [...prev, res.data]);
    }
  };

  const newMessageHandler = (res: ResponseProps) => {
    if(res.success) {
      let conversationId = res.data.conversationId;
      setConversations(prev => {
        let updatedConversations =  prev.map((item) => {
          if(item._id == conversationId) item.lastMessage = res.data;
          return item;
        })

        return updatedConversations;
      })
    }
  }

  useEffect(() => {
    getConversations(processConversations);
    newConversation(newConversationHandler);
    newMessage(newMessageHandler);

    getConversations(null);
    
    return () => {
      getConversations(processConversations, true);
      newConversation(newConversationHandler, true);
      newMessage(newMessageHandler, true);
    }
  }, [])


  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typo
              color={colors.neutral200}
              size={19}
              textProps={{ numberOfLines: 1 }}
            >
              Welcome back,{" "}
              <Typo size={20} color={colors.white} fontWeight={'800'} >{currentUser?.name}</Typo>
            </Typo>
          </View>

          <TouchableOpacity style={styles.settingIcon} onPress={() => router.push("/(main)/profileModal")} >
            <Icons.GearSix color={colors.white} weight="fill" size={verticalScale(22)} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingVertical: spacingY._20}}>
            {/* Tabs  */}
            <View style={styles.navBar}>
              <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tabStyle, selectedTab == 0 && styles.activeTabStyle]} onPress={() => setSelectedTab(0)}>
                  <Typo>Direct Messages</Typo>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabStyle, selectedTab == 1 && styles.activeTabStyle]} onPress={() => setSelectedTab(1)}>
                  <Typo>Groups</Typo>
                </TouchableOpacity>
              </View>
            </View>

            {/* conversation UI  */}
            <View style={styles.conversationList}>
              {
                selectedTab == 0 && directConversations.map((item: ConversationProps, index) => <ConversationItem item={item} key={index} router={router} showDivider={directConversations.length !== index+1} />)
              }
              {
                selectedTab == 1 && groupConversations.map((item: ConversationProps, index) => <ConversationItem item={item} key={index} router={router} showDivider={groupConversations.length !== index+1} />)
              }
            </View>

            {
              !loading && selectedTab == 0 && directConversations.length == 0 && (
                <Typo style={{textAlign: "center"}}>You don't have any messages</Typo>
              )
            }
            {
              !loading && selectedTab == 1 && groupConversations.length == 0 && (
                <Typo style={{textAlign: "center"}}>You haven't joined any group's yet</Typo>
              )
            }

            {
              loading && <Loading />
            }
          </ScrollView>
        </View>
      </View>

      <Button style={styles.floatingButton} 
        onPress={() => 
        router.push({
          pathname: "/(main)/newConversationModal",
          params: { isGroup: selectedTab},
        })}
      >
        <Icons.PlusIcon color={colors.black} weight="bold" size={verticalScale(24)} />
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    gap: spacingY._15,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._20,
  },
  navBar: {
    flexDirection: "row",
  },
  tabs: {
    flexDirection: "row",
    gap: spacingX._10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabStyle: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius.full,
    backgroundColor: colors.neutral100,
  },
  activeTabStyle: {
    backgroundColor: colors.primaryLight,
  },
  conversationList: {
    paddingVertical: spacingY._20,
  },
  settingIcon: {
    padding: spacingY._10,
    backgroundColor: colors.neutral700,
    borderRadius: radius.full,
  },
  floatingButton: {
    width: verticalScale(50),
    height: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
});
