import Avatar from '@/components/Avatar'
import BackButton from '@/components/BackButton'
import Header from '@/components/header'
import Input from '@/components/Input'
import Loading from '@/components/Loading'
import MessageItem from '@/components/MessageItem'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authContext'
import { uploadFileToCloudinary } from '@/services/imageService'
import { getMessages, newMessage } from '@/socket/socketEvents'
import { MessageProps, ResponseProps } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams } from 'expo-router'
import * as Icons from "phosphor-react-native"
import React, { useEffect, useState } from 'react'
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'

const Conversation = () => {
  const {id: conversationId, name, participants: stringifiedParticipants, avatar, type} = useLocalSearchParams();
  const {user: currentUser} = useAuth();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{uri: string} | null>(null);
  const [messagesList, setMessagesList] = useState<MessageProps[]>([]);

  const participants = JSON.parse(stringifiedParticipants as string);
  let conversationAvatar = avatar;
  let isDirect = type == 'direct';
  const otherParticipant = isDirect ? participants.find((p: any) => p._id !== currentUser?.id) : null;
  
  if(isDirect && otherParticipant.avatar) {
    conversationAvatar = otherParticipant.avatar;
  };

  let conversationName = isDirect ? otherParticipant.name : name;

  const onPickFile = async() => {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Permission to access the media library is required.');
        return;
      }
  
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        // allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
  
      console.log(result);
  
      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
  }

  const onSend = async() => {
    if(!message.trim() && !selectedFile) return ;

    if(!currentUser) return ;

    setLoading(true);

    try {
      let attachement = null;
      if(selectedFile) {
        const uploadResult = await uploadFileToCloudinary(selectedFile, "message-attachements");

        if(uploadResult.success) {
          attachement = uploadResult.data;
        } else {
          setLoading(false);
          Alert.alert("Error", "Could not send the message");
        }
      }

      // console.log("attachement: ", attachement);
      newMessage({
        conversationId, 
        sender:{
          id: currentUser?.id,
          name: currentUser.name, 
          avatar: currentUser.avatar,
        }, 
        content: message.trim(),
        attachement
      });

      setMessage("");
      setSelectedFile(null);

    }
    catch(error) {
      console.log('Error sending message: ', error);
      Alert.alert("Error", "Failed to send message");
    }
    finally {
      setLoading(false); 
    }
  }

  const newMessageHandler = (res: ResponseProps) => {
    setLoading(false);

    if(res.success) {
      if(res.data.conversationId == conversationId) {
        setMessagesList(prev => [res.data as MessageProps, ...prev]);
      }
    } else {
      Alert.alert("Error in newMessage handler: ", res.msg);
    }
  };

  const messagesHandler = (res: ResponseProps) => {
    if(res.success) setMessagesList(res.data);
  }

  useEffect(() => {
    newMessage(newMessageHandler);
    getMessages(messagesHandler);

    getMessages({conversationId});
    
    return () => {
      newMessage(newMessageHandler, true);
      getMessages(messagesHandler, true);
    }
  }, [])
  


  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : "height"} style={styles.container}>
        {/* header  */}
        <Header style={styles.header} 
          leftIcon={
            <View style={styles.headerLeft}>
              <BackButton />
              <Avatar size={40} uri={conversationAvatar as string} isGroup={type == 'group'} />
              <Typo color={colors.white} fontWeight={'500'} size={22}>{conversationName}</Typo>
            </View>
          } 
          rightIcon={
            <TouchableOpacity style={{marginBottom: verticalScale(7)}}>
              <Icons.DotsThreeOutlineVerticalIcon weight='fill' color={colors.white} />
            </TouchableOpacity>
          }
        />

        {/* Message  */}
          <View style={styles.content}>
            <FlatList
              data={messagesList} 
              inverted={true} 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.messagesContent} 
              keyExtractor={(item) => item.id}
              renderItem={({item}) => (
                <MessageItem item={item} isDirect={isDirect} />
              )}
            />

            {/* Input box  */}
            <View style={styles.footer}>
              <Input 
                value={message} 
                onChangeText={setMessage} 
                containerStyle={{
                  paddingLeft: spacingX._10, 
                  paddingRight: scale(65), 
                  borderWidth: 0
                }}  
                placeholder='Write your message'
                icon={
                  <TouchableOpacity style={styles.inputIcon} onPress={onPickFile}>
                    <Icons.PlusIcon  color={colors.black} weight='bold' size={verticalScale(22)} />

                    {
                      selectedFile && selectedFile.uri && (
                        <Image source={selectedFile.uri} style={styles.selectedFile } />
                      )
                    }
                  </TouchableOpacity>
                }
              />

              <View style={styles.inputRightIcon}>
                <TouchableOpacity style={styles.inputIcon} onPress={onSend} >
                  {
                    loading ? (
                      <Loading size="small" color={colors.black} />
                    ) : (
                      <Icons.PaperPlaneTiltIcon color={colors.black} weight='fill' size={verticalScale(22)} />
                    )
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

export default Conversation

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacingX._15, 
    paddingTop: spacingY._10,
    paddingBottom: spacingY._15
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12
  },
  inputRightIcon: {
    position: "absolute",
    right: scale(10),
    top: verticalScale(15),
    paddingLeft: spacingX._12,
    borderLeftWidth: 1.5, 
    borderLeftColor: colors.neutral300,
  },
  selectedFile: {
    position: "absolute",
    height: verticalScale(38),
    width: verticalScale(38),
    borderRadius: radius.full,
    alignSelf: "center",
  },
  content: {
    flex: 1, 
    backgroundColor: colors.white, 
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._15
  },
  inputIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8
  },
  footer: {
    paddingTop: spacingY._7,
    paddingBottom: verticalScale(22),
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: spacingY._20,
    paddingBottom: spacingY._10,
    gap: spacingY._12
  },
  plusIcon: {
    backgroundColor: colors.primary, 
    borderRadius: radius.full,
    padding: 8
  },

})