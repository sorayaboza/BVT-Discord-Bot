// To run once, type: node .
// To run & allow changes, type: nodemon discbot

import { Client, GatewayIntentBits, GatewayOpcodes } from 'discord.js';
import { getVoiceData, updateVoiceData, getUserTotalHours, getOneVoice, createVoiceData, getUserMonthlyHours } from './database.js';
import express from 'express'

const token = process.env.TOKEN
const app = express()
const hostname = '127.0.0.1';
const port = 3000;

app.use(express.json())

app.get("/voicedata", async (req, res) => {
    const voicedata = await getVoiceData()
    res.send(voicedata)
})

// Posting data in json format
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/voicedata`);
  });

// Create a new Discord client with specified intents
const client = new Client({ 
    intents: [
        // Specify the intents required for the bot to function properly
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildPresences, 
        GatewayOpcodes.Identify, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessageTyping, 
        GatewayIntentBits.AutoModerationExecution, 
        GatewayIntentBits.DirectMessageReactions, 
        GatewayIntentBits.GuildIntegrations, 
        GatewayIntentBits.GuildVoiceStates
    ] 
});

// When the bot is ready, log a message to the console
client.once('ready', () => {
    console.log('Bot is ready!');
});

// Welcome new guild members
client.on('guildMemberAdd', member => {
    // Find the channel named 'welcome' within the guild
    const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'welcome'); // Adjust 'welcome' to your channel's name
    if (!welcomeChannel) return;
    welcomeChannel.send(`Welcome to the server, ${member}!`);
});

// Checking time spent in call
let timeEntered = 0;
let timeLeft = 0;
let inCall = false;

// Logic to handle voice state updates
client.on('voiceStateUpdate', async (oldState, newState) => {
    // Extract information about the new and old voice states of the user
    let newUserChannel = newState.channel;
    let oldUserChannel = oldState.channel;

    // Check if the user has joined a voice channel
    if (oldUserChannel === null && newUserChannel !== null) {
        // User joins a voice channel
        console.log("User joined call.");
        inCall = true;
        const currentDate = new Date();
        timeEntered = currentDate.getTime();
    } else if (oldUserChannel !== null && newUserChannel === null) {
        // User leaves a voice channel
        inCall = false;
        const currentDate = new Date();
        timeLeft = currentDate.getTime();
        let secondsSpent = Math.floor((timeLeft - timeEntered) / 1000); // Calculating seconds spent in call

        const voicedata = await getVoiceData();
        let userID = newState.id;
        const user = voicedata.find(user => user.userID === userID);

        // Get current month and year
        let month = currentDate.toLocaleString('default', { month: 'long' });
        let year = currentDate.getFullYear();
        let monthlyHoursColumn = `hours${month}${year}`;

        if (user) {
            console.log('User ID exists in the data.');
            // Update the total hours
            let newTotalHours = parseFloat(user.totalHours) + (secondsSpent / 3600); // Convert seconds to hours
            newTotalHours = (Math.round(newTotalHours * 1000) / 1000).toFixed(3); // Round to the nearest 1000th

            // Update the monthly hours
            let currentMonthlyHours = await getUserMonthlyHours(userID, monthlyHoursColumn);
            let newMonthlyHours = (currentMonthlyHours ? parseFloat(currentMonthlyHours) : 0) + (secondsSpent / 3600);
            newMonthlyHours = (Math.round(newMonthlyHours * 1000) / 1000).toFixed(3);

            await updateVoiceData(userID, newTotalHours, monthlyHoursColumn, newMonthlyHours);
            console.log('Total hours and monthly hours updated.');
        } else {
            console.log('User ID does not exist in the data.');
            // Add the new user to the database
            let initialHours = (Math.round((secondsSpent / 3600) * 1000) / 1000).toFixed(3); // Store initial hours as converted from seconds and rounded
            await createVoiceData(userID, initialHours, monthlyHoursColumn, initialHours);
            console.log('User ID added to the data.');
        }

        getOneVoice(userID);

        // Check if there was a change in voice channels (e.g., user switched voice channels)
    } else if (oldUserChannel !== null && newUserChannel !== null && oldUserChannel.id != newUserChannel.id) {
        // Additional logic for handling voice channel switches can be added here if needed
    }
});

// Listen for new messages
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // Check your total time spent in voice channels.
    if (message.content.startsWith('!voicetime')) {
        const userId = message.author.id;
        const totalHours = await getUserTotalHours(userId);

        if (totalHours == null) {
            message.reply(`You have no hours on call.`);
            return;
        }
        
        let finalTime = calculateTotalTime(totalHours);
        
        message.reply(`You have spent a total of ${finalTime} in voice channels.`);
    }

    // Check how much time you've been in the current call.
    if (message.content.startsWith('!incall')) {
        const currentDate = new Date()
        let currentTime = currentDate.getTime()
        let timeDifference = currentTime - timeEntered
        let hoursSpent = Math.floor(timeDifference / (1000 * 60 * 60))
        let minutesSpent = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
        let secondsSpent = Math.floor((timeDifference % (1000 * 60)) / 1000)
        if (!inCall) {
            message.reply("You are not currently in a call.")
            return
        }
        message.reply(`You have spent a total of ${hoursSpent.toString().padStart(2, '0')}:${minutesSpent.toString().padStart(2, '0')}:${secondsSpent.toString().padStart(2, '0')} in call.`)
        return
    }
    // Creating roles
    if (message.content.startsWith('!makerole')) {
        console.log("This feature has yet to be implemented.")
    }

    // Admin only.
    if (message.content.startsWith('!admintest')) {
        if (!message.member.roles.cache.some(role => role.name === 'admin')) {
            message.reply('Not an admin.')
            return
        } else {
            message.reply('You are an admin.')
            return
        }
    }

    let guvt_prefix = '!guvt' // Get user voice time
    const guvt = message.content.slice(guvt_prefix.length).trim().split(' ');

    let addr_prefix = '!addr' // Add role
    const addr = message.content.slice(addr_prefix.length).trim().split(' ');

    let remr_prefix = '!remr' // Remove role
    const remr = message.content.slice(remr_prefix.length).trim().split(' ');

    if (message.content.startsWith('!addr')) {
        if (!message.member.roles.cache.some(role => role.name === 'admin')) {
            message.reply('This is an admin-only command.')
            return
        }
        if (message.content.length <= addr_prefix.length) {
            message.reply(`You didn't provide any arguments, ${message.author}!`);
            return
        }
        // !addr <@507908285714661388> fun
        let atMessage = addr.toString()
        const roleName = atMessage.split(',')[1].trim();
        let curr_member = message.mentions.members.first();

        let role = curr_member.guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            // do something if either member or role not available
            message.reply('Role does not exist.')
            return null;
        }
        // Add the role to the member
        curr_member.roles.add(role)
        .then(() => message.reply(`Role '${role.name}' has been added to ${curr_member}.`))
        .catch(error => {
            console.error('Error adding role:', error);
            message.reply('There was an error adding the role.');
        });
    }
    if (message.content.startsWith('!remr')) {
        if (!message.member.roles.cache.some(role => role.name === 'admin')) {
            message.reply('This is an admin-only command.')
            return
        }
        if (message.content.length <= remr_prefix.length) {
            message.reply(`You didn't provide any arguments, ${message.author}!`);
            return
        }
        // !remr <@507908285714661388> fun
        let atMessage = remr.toString()
        const roleName = atMessage.split(',')[1].trim();
        let curr_member = message.mentions.members.first();

        let role = curr_member.guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            // do something if either member or role not available
            message.reply('Role does not exist.')
            return null;
        }
        // Add the role to the member
        curr_member.roles.remove(role)
        .then(() => message.reply(`Role '${role.name}' has been removed from ${curr_member}.`))
        .catch(error => {
            console.error('Error adding role:', error);
            message.reply('There was an error adding the role.');
        });
    }
    if (message.content.startsWith('!guvt')) {
        if (!message.member.roles.cache.some(role => role.name === 'admin')) {
            message.reply('This is an admin-only command.');
            return;
        }
        if (message.content.length <= '!guvt'.length) {
            message.reply(`You didn't provide any arguments, ${message.author}!`);
            return;
        }
        
        let mentionedUser = message.mentions.users.first();
        if (!mentionedUser) {
            message.reply(`Please mention a user to check their voice time.`);
            return;
        }
        
        const userId = mentionedUser.id;
        const totalHours = await getUserTotalHours(userId);
    
        if (totalHours == null) {
            message.reply(`User has no hours in call/doesn't exist in this server.`);
            return;
        }
        
        let finalTime = calculateTotalTime(totalHours);
        
        const exampleEmbed = {
            color: 0x0099ff,
            fields: [
                {
                    name: 'Total Voice Time',
                    value: `🕗 Total time spent in calls by ${mentionedUser}: ${finalTime}`,
                },
            ],
        };
    
        message.reply({ embeds: [exampleEmbed] });
    }
    

    // Utility functions
    function calculateTotalTime(totalHours) {
        let totalSeconds = totalHours * 3600;
            
        // Calculate hours, minutes, and remaining seconds
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        
        // Format each part with leading zeros if necessary
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        
        // Construct the formatted time string
        const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

        return formattedTime;
    }
});

client.login(token);
