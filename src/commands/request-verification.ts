import { Command } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, Message } from 'discord.js';
import config from '../config.json';
import { getEpoch } from '../lib/utils';
import { getUserEmbed } from '../lib/userEmbed';

export class RequestVerificationCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: 'request-verification',
			description: 'Request verification'
		});
	}

	public override async messageRun(message: Message) {
		// Get roles from config
		const adminRoleID = config.roles['admin-role'];
		const whitelistedRoleID = config.roles['whitelisted-role'];

		// Get channels from config
		const verificationChannelID = config.channels['verification-channel'];
		const verificationRequestChannelID = config.channels['verification-request-channel'];
		const logsChannelId = config.channels['log-channel'];

		// Get guild
		const guild = message.guild;
		if (!guild) return;

		// Get channels from guild
		const channel = message.channel;
		const verificationRequestChannel = guild.channels.cache.get(verificationRequestChannelID)!;
		const logsChannel = guild.channels.cache.get(logsChannelId)!;

		// Check if the channels are valid
		if (
			channel.type !== ChannelType.GuildText ||
			logsChannel.type !== ChannelType.GuildText ||
			verificationRequestChannel.type !== ChannelType.GuildText
		) {
			return;
		}

		// Get member
		const member = await guild.members.fetch(message.author.id);
		if (!member) return;

		// Get epoch
		const rightNowEpoch = getEpoch(Date.now());

		// Check if the member is sending the command in the right channel and is not already whitelisted
		if (channel.id !== verificationChannelID) return;
		if (member.roles.cache.has(whitelistedRoleID)) return message.reply('You are already whitelisted.');

		// Send a typing indicator
		await channel.sendTyping();

		// Create embeds
		const verificationRequestEmbed = new EmbedBuilder()
			.setDescription(
				`# Verification Request\n\nThis person has requested that they be verified in the server.\nYou can either approve or deny this request using the buttons below.\n\nThis request was sent <t:${rightNowEpoch}:R>\n\n-# *Please remember that if you deny the request, the person will be kicked from the server.*`
			)
			.setColor('Blurple');

		const requestSentEmbed = new EmbedBuilder()
			.setDescription(
				'# Request Sent ✅\n\nYour request has been sent to the verification channel.\nYou will be notified when it is approved or denied.'
			)
			.setColor('Blurple');

		const logEmbed = new EmbedBuilder()
			.setDescription(`<@${message.author.id}> (\`${message.author.id}\`) requested verification <t:${rightNowEpoch}:R>`)
			.setColor('Blurple');

		// Create buttons
		const approveButton = new ButtonBuilder().setCustomId(`approve-${message.author.id}`).setLabel('Approve').setStyle(ButtonStyle.Success);
		const denyButton = new ButtonBuilder().setCustomId(`deny-${message.author.id}`).setLabel('Deny').setStyle(ButtonStyle.Danger);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveButton, denyButton);

		// Send messages
		const verificationRequestMessage = await verificationRequestChannel.send({
			content: `<@&${adminRoleID}>`,
			embeds: [verificationRequestEmbed, getUserEmbed(member)],
			components: [row]
		});
		const logMessage = await logsChannel.send({ embeds: [logEmbed, getUserEmbed(member)] });

		// Check if the messages were sent
		if (!verificationRequestMessage || !logMessage) return message.reply('An error occurred while sending the verification request.');

		// Send reply
		return await message.reply({ embeds: [requestSentEmbed] });
	}
}
