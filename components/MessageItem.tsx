import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authContext'
import { MessageProps } from '@/types'
import { verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import moment from 'moment'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import Avatar from './Avatar'
import Typo from './Typo'

const MessageItem = ({item, isDirect}: {item: MessageProps, isDirect: boolean}) => {

    const {user: currentUser} = useAuth();
    const isMe = currentUser?.id == item?.sender?.id;

      const formattedDate = moment(item.createdAt).isSame(moment(), "day") ?
      moment(item.createdAt).format("h:mm A") :
      moment(item.createdAt).format("MMM D, h:mm A");
    

  return (
    <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
      {
        !isMe && !isDirect && (
            <Avatar size={30} uri={item.sender.avatar} style={styles.messageAvatar} />
        )
      }

        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
            {!isMe && !isDirect && (
                <Typo color={colors.neutral900} fontWeight={'600'} size={13}>{item.sender.name}</Typo>
            )}

            {
                item.content && <Typo size={15}>{item.content}</Typo>
            }

            {
                item.attachement && (
                    <Image source={item.attachement} contentFit="cover" style={styles.attachement} transition={100} />
                )
            }

            <Typo style={{alignSelf: "flex-end"}} size={11} fontWeight={'500'} color={colors.neutral600}>{formattedDate}</Typo>
        </View>

      
    </View>
  )
}

export default MessageItem

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: "row",
        gap: spacingX._7,
        maxWidth: "80%"
    },
    myMessage: {
        alignSelf: "flex-end"
    },
    theirMessage: {
        alignSelf: "flex-start"
    },
    messageAvatar: {
        alignSelf: "flex-end"
    },
    attachement: {
        height: verticalScale(180),
        width: verticalScale(180),
        borderRadius: radius._10
    },
    messageBubble: {
        padding: spacingX._10,
        borderRadius: radius._15,
        gap: spacingY._5
    },
    myBubble: {
        backgroundColor: colors.myBubble
    },
    theirBubble: {
        backgroundColor: colors.otherBubble
    },
})