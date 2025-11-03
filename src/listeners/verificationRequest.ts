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

		if (interaction.customId === 'verify') {
			// Get the user id
			const id = interaction.user.id;

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

			// Check to see if the user is already whitelisted
			if (member.roles.cache.has(whitelistedRole.id)) {
				await interaction.reply({ content: "You're already whitelisted!", flags: MessageFlags.Ephemeral });
				return;
			}

			// Remove the not-verified role and add the whitelisted role
			await member.roles.remove(notVerifiedRole);
			await member.roles.add(whitelistedRole);

			// Create embeds
			const logEmbed = new EmbedBuilder().setDescription(`<@${id}> (\`${id}\`) verified their account.`).setColor('Blurple');

			// Send embeds & DMs
			await logChannel.send({ embeds: [logEmbed, getUserEmbed(member)] });
			await interaction.reply({ content: "You've been veriried successfully!", flags: MessageFlags.Ephemeral });
		}
	}
}
