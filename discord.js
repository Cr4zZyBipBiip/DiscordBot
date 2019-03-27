// Trigger on VOICE_STATE_UPDATE events.
client.on('voiceStateUpdate', (oldMember, member) => {

  // Check if the user entered a new channel.
  if (member.voiceChannelID) {
    const newChannel = member.guild.channels.get(member.voiceChannelID);

    // If the user entered a game channel (prefixed with a game controller unicode emoji), group them into their own channel.
    // https://emojipedia.org/emoji/%F0%9F%8E%AE/ 🎮
    if (newChannel.name.startsWith(String.fromCodePoint('U+1F3AE'))) {
      newChannel.clone(String.fromCodePoint('0x2501') + ' Room')
      .then(createdChannel => {
        createdChannel.setParent(newChannel.parentID);
        var permissions = newChannel.permissionOverwrites;
        permissions.forEach(elemPerm => {
          console.log(elemPerm)
          // 1 == Create invitation
          // 16 == Gerer salon
          // 1024 == VIEW_CHANNEL
          // 1048576 == CONNECT
          // 2097152 == talk
          // 4194304 == rendre muet
          // 8388608 == rendre sourd
          // 16777216 == déplacer membre
          // 33554432 == detection de voix
          // 268435456 == gerer permissions
          // 536870912 == gerer webhooks
          var permCreateinvite = false;
          var permManage = false;
          var permView = false;
          var permConnect = false;
          var permSpeak = false;
          var permMute = false;
          var permDeaf = false;
          var permMove = false;
          var permVAD = false;
          var permRoles = false;
          var permWebhook = false;

          var allowTmp = elemPerm.allow
          if (allowTmp - 536870912 >= 0) {
            console.log('webhook');
            allowTmp -= 536870912;
            permWebhook = true;
          }
          if (allowTmp - 268435456 >= 0) {
            console.log('perm');
            allowTmp -= 268435456;
            permRoles = true;
          }
          if (allowTmp - 33554432 >= 0) {
            console.log('detection');
            allowTmp -= 33554432;
            permVAD = true;
          }
          if (allowTmp - 16777216 >= 0) {
            console.log('deplace');
            allowTmp -= 16777216;
            permMove = true;
          }
          if (allowTmp - 8388608 >= 0) {
            console.log('sourd');
            allowTmp -= 8388608;
            permDeaf = true;
          }
          if (allowTmp - 4194304 >= 0) {
            console.log('muet');
            allowTmp -= 4194304;
            permMute = true;
          }
          if (allowTmp - 2097152 >= 0) {
            console.log('talk');
            allowTmp -= 2097152;
            permSpeak = true;
          }
          if (allowTmp - 1048576 >= 0) {
            console.log('connect');
            allowTmp -= 1048576;
            permConnect = true;
          }
          if (allowTmp - 1024 >= 0) {
            console.log('view');
            allowTmp -= 1024;
            permView = true;
          }
          if (allowTmp - 16 >= 0) {
            console.log('gerer');
            allowTmp -= 16;
            permManage = true;
          }
          if (allowTmp - 1 >= 0) {
            console.log('invit');
            allowTmp -= 1;
            permCreateinvite = true;
          }
          var denyTmp = elemPerm.deny
          if (denyTmp - 536870912 >= 0) {
            console.log('webhook');
            denyTmp -= 536870912;
            permWebhook = false;
          }
          if (denyTmp - 268435456 >= 0) {
            console.log('perm');
            denyTmp -= 268435456;
            permRoles = false;
          }
          if (denyTmp - 33554432 >= 0) {
            console.log('detection');
            denyTmp -= 33554432;
            permVAD = false;
          }
          if (denyTmp - 16777216 >= 0) {
            console.log('deplace');
            denyTmp -= 16777216;
            permMove = false;
          }
          if (denyTmp - 8388608 >= 0) {
            console.log('sourd');
            denyTmp -= 8388608;
            permDeaf = false;
          }
          if (denyTmp - 4194304 >= 0) {
            console.log('muet');
            denyTmp -= 4194304;
            permMute = false;
          }
          if (denyTmp - 2097152 >= 0) {
            console.log('talk');
            denyTmp -= 2097152;
            permSpeak = false;
          }
          if (denyTmp - 1048576 >= 0) {
            console.log('connect');
            denyTmp -= 1048576;
            permConnect = false;
          }
          if (denyTmp - 1024 >= 0) {
            console.log('view');
            denyTmp -= 1024;
            permView = false;
          }
          if (denyTmp - 16 >= 0) {
            console.log('gerer');
            denyTmp -= 16;
            permManage = false;
          }
          if (denyTmp - 1 >= 0) {
            console.log('invit');
            denyTmp -= 1;
            permCreateinvite = false;
          }

          createdChannel.overwritePermissions(elemPerm.id, {
            CREATE_INSTANT_INVITE: permCreateinvite,
            MANAGE_CHANNELS: permManage,
            VIEW_CHANNEL: permView,
            CONNECT: permConnect,
            SPEAK: permSpeak,
            MUTE_MEMBERS: permMute,
            DEAFEN_MEMBERS: permDeaf,
            MOVE_MEMBERS: permMove,
            USE_VAD: permVAD,
            MANAGE_ROLES: permRoles,
            MANAGE_WEBHOOKS: permWebhook
          });
        })
        createdChannel.edit({
          bitrate: 96000,
          position: newChannel.position + 50,
          userLimit: 4
        })
        .then(createdChannel => {
          member.setVoiceChannel(createdChannel)
          .then(console.log('[' + new Date().toISOString() + '] Moved user "' + member.user.username + '#' + member.user.discriminator + '" (' + member.user.id + ') to ' + createdChannel.type + ' channel "' + createdChannel.name + '" (' + createdChannel.id + ') at position ' + createdChannel.position))
          .catch(console.error);
        })
        .catch(console.error);
      })
      .catch(console.error);
    }
  }

  // Check if the user came from another channel.
  if (oldMember.voiceChannelID) {
    const oldChannel = oldMember.guild.channels.get(oldMember.voiceChannelID);

    // Delete the user's now empty temporary channel, if applicable.
    if (oldChannel.name.startsWith(String.fromCodePoint('0x2501')) && !oldChannel.members.array().length) {
      oldChannel.delete()
      .then(function() {
        console.log('[' + new Date().toISOString() + '] Deleted ' + oldChannel.type + ' channel "' + oldChannel.name + '" (' + oldChannel.id + ')');
      })
      .catch(console.error);
    }
  }
});
