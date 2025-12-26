import { colors, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/context/authContext';
import { ConversationListItemProps } from '@/types';
import moment from "moment";
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from './Avatar';
import Typo from './Typo';

const ConversationItem: React.FC<ConversationListItemProps> = ({item, showDivider, router}) => {

  
  const {user: currentUser} = useAuth();
  
  const lastMessage = item?.lastMessage;
  const isDirect = item.type == 'direct';
  let avatar = item.avatar;

  const otherParticipant = isDirect ? item.participants.find(p => p._id != currentUser?.id) : null;
  if(isDirect && otherParticipant) avatar = otherParticipant?.avatar;
  
  const getLastMessageContent = () => {
    if(!lastMessage) return "Say hi 👋 !!";
    
    return lastMessage?.attachement? "Image" : lastMessage.content;
  }

  const getLastMessageDate = () => {
    if(!lastMessage?.createdAt) return null;
    const messageDate = moment(lastMessage.createdAt);
    
    const today = moment();
    
    if(messageDate.isSame(today, "day")) {
      return messageDate.format("h:mm A");
    }
    if(messageDate.isSame(today, "year")) {
      return messageDate.format("MMM D");
    }
    
    return messageDate.format("MMM D, YYYY");
  };

  const openConversation = () => {
    router.push({
      pathname: "/(main)/conversation",
      params: {
        id: item._id, 
        name: item.name,
        avatar: item.avatar,
        type: item.type,
        participants: JSON.stringify(item.participants),
      },
    })
  }
  


  return (
    <View>
      <TouchableOpacity style={styles.conversationItem} onPress={openConversation}>
        <View>
          <Avatar uri={avatar} size={47} isGroup={item.type == 'group'} />
        </View>

        <View style={{flex: 1}}>
          <View style={styles.row}>
            <Typo size={17} fontWeight={'600'}>{ isDirect ? otherParticipant?.name : item?.name}</Typo>

            {
              item.lastMessage && <Typo size={15}>{getLastMessageDate()} </Typo>
            }
          </View>

          
          <Typo size={15} color={colors.neutral600} textProps={{numberOfLines: 1}}>{getLastMessageContent()}</Typo>
        </View>
      </TouchableOpacity>

      {
        showDivider && <View style={styles.divider} />
      }
    </View>
  )
}

export default ConversationItem

const styles = StyleSheet.create({
  conversationItem: {
    gap: spacingX._10, 
    marginVertical: spacingY._12,
    flexDirection: "row",
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  divider: {
    height: 1, 
    width: "95%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.07)"
  }
})