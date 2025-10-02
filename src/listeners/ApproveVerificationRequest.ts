import { Events, Listener } from '@sapphire/framework';
import { ChannelType, EmbedBuilder, Interaction, MessageFlags } from 'discord.js';
import config from '../config.json';
import { getUserEmbed } from '../lib/userEmbed';

export class ApproveVerificationRequestListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: Events.InteractionCreate
		});
	}

	public async run(interaction: Interaction) {
		if (!interaction.isButton()) return;

		if (interaction.customId.startsWith('approve-')) {
			// Get the user id
			const id = interaction.customId.split('-')[1];

			// Get the guild
			const guild = interaction.guild;
			if (!guild) return;

			// Get the roles
			const notVerifiedRoleId = config.roles['not-verified-role'];
			const whitelistedRoleId = config.roles['whitelisted-role'];

			const notVerifiedRole = interaction.guild.roles.cache.get(notVerifiedRoleId);
			const whitelistedRole = interaction.guild.roles.cache.get(whitelistedRoleId);
			if (!notVerifiedRole || !whitelistedRole) return;

			// Get the log channel
			const logChannelId = config.channels['log-channel'];

			const logChannel = guild.channels.cache.get(logChannelId);
			if (!logChannel) return;

			if (logChannel.type !== ChannelType.GuildText) return;

			// Get the member
			const member = await guild.members.fetch(id);
			if (!member) return;

			// Remove the not-verified role and add the whitelisted role
			await member.roles.remove(notVerifiedRole);
			await member.roles.add(whitelistedRole);

			// Create embeds
			const logEmbed = new EmbedBuilder()
				.setDescription(`<@${id}> (\`${id}\`) was approved by <@${interaction.user.id}> (\`${interaction.user.id}\`).`)
				.setColor('Blurple');

			const newEmbed = new EmbedBuilder()
				.setDescription(`# Verification Request\n\nThe verification request for <@${id}> has been approved.`)
				.setColor('Green');

			// Send embeds & DMs
			await logChannel.send({ embeds: [logEmbed, getUserEmbed(member)] });
			await member.user.send({ content: `✅ | Your verification request in ${interaction.guild.name} has been approved.` });
			await interaction.reply({ content: 'Verification request approved', flags: MessageFlags.Ephemeral });
			await interaction.message.edit({ content: '', components: [], embeds: [newEmbed, getUserEmbed(member)] });
		}
	}
}
