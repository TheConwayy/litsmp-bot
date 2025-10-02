import { Events, Listener } from '@sapphire/framework';
import { ChannelType, EmbedBuilder, Interaction, MessageFlags } from 'discord.js';
import config from '../config.json';
import { getUserEmbed } from '../lib/userEmbed';

export class DenyVerificationRequestListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: Events.InteractionCreate
		});
	}

	public async run(interaction: Interaction) {
		if (!interaction.isButton()) return;

		if (interaction.customId.startsWith('deny-')) {
			// Get the user id
			const id = interaction.customId.split('-')[1];

			// Get the guild
			const guild = interaction.guild;
			if (!guild) return;

			// Get the log channel
			const logChannelId = config.channels['log-channel'];

			const logChannel = guild.channels.cache.get(logChannelId);
			if (!logChannel) return;

			if (logChannel.type !== ChannelType.GuildText) return;

			// Get the member
			const member = await guild.members.fetch(id);
			if (!member) return;

			// Create embeds
			const logEmbed = new EmbedBuilder()
				.setDescription(`<@${id}> (\`${id}\`) was denied by <@${interaction.user.id}> (\`${interaction.user.id}\`).`)
				.setColor('Blurple');

			const newEmbed = new EmbedBuilder()
				.setDescription(`# Verification Request\n\nThe verification request for <@${id}> has been denied.`)
				.setColor('Red');

			// Send embeds & DMs
			await logChannel.send({ embeds: [logEmbed, getUserEmbed(member)] });
			await member.user.send({
				content: `❌ | Your verification request in ${interaction.guild.name} has been denied and you have been kicked from the server.`
			});
			await interaction.reply({ content: 'Verification request denied', flags: MessageFlags.Ephemeral });
			await interaction.message.edit({ content: '', components: [], embeds: [newEmbed, getUserEmbed(member)] });

			// Kick member
			if (!member.kickable) return;
			await member.kick('Verification request denied');
		}
	}
}
