const Discord = require('discord.js');
const settings = require('../config.json');

const functions = require('../functions');

module.exports = {
	name: 'endpoll',
	description: 'Close a poll using the poll channel and ID',
	admin: false,
	execute(client, message, args) {
		if (args.length == 2) {
			let guild = client.guilds.cache.get(settings.guild_id);
			let channel = guild.channels.cache.find(ch => ch.name === args[0]);
			if (channel != null) {
				channel.messages.fetch(args[1])
					.then(poll_msg => {
						client.polls.get('all').then(all => {
							if (all != undefined && all.includes(args[1])) {
								client.polls.get(args[1]).then(poll => {
									if (poll != undefined) {
										if (poll['creator']['name'] === message.author.tag) {
											let embed = functions.generatePollEmbed({
												name: poll['name'],
												description: poll['description'],
												author: poll['creator']['name'],
												avatar: poll['creator']['avatar'],
												options: functions.formatOptions(poll['options']),
												results: functions.formatResults(poll['results']),
												closed: true,
											});
											poll_msg.edit(embed);
											client.polls.delete(args[1]);
											// Delete entry in all
											let index = all.indexOf(args[1]);
											if (index !== -1) all.splice(index, 1);
											client.polls.set('all', all);
											message.channel.send(`Ok, I've closed that poll. Any further reactions will be ignored.`);
										} else {
											message.channel.send(`Only the user that created that poll can close it.`);
										}
									} else {
										// Delete entry in all
										let index = all.indexOf(args[1]);
										if (index !== -1) all.splice(index, 1);
										client.polls.set('all', all);
									}
								});
							} else {
								message.channel.send(`I found the poll, but it looks like it's already been closed.`);
							}
						});
					})
					.catch(() => {
						message.channel.send(`I couldn't find that poll in the CSIT Society Discord server, maybe it's in a different channel?`);
					});
			} else {
				message.channel.send(`I couldn't find a channel called "${args[0]}" in the CSIT Society Discord server.`);
			}
		} else {
			message.channel.send("Usage: `endpoll [channel name] [poll ID]`");
		}
	}
};
