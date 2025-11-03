import { Command } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Message } from 'discord.js';
import config from '../config.json';
import { EmbedBuilder } from 'discord.js';

export class SetupVerificationEmbedCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: 'setup-verification-embed',
			description: 'Setup verification embed'
		});
	}

	public override async messageRun(message: Message) {
		// Get channels
		const verificationChannelId = config.channels['verification-channel'];
		const logsChannelId = config.channels['log-channel'];

		// Get guild
		const guild = message.guild;
		if (!guild) return;

		// Get channels from guild
		const verificationChannel = guild.channels.cache.get(verificationChannelId)!;
		const logsChannel = guild.channels.cache.get(logsChannelId)!;

		// Check if the channels are valid
		if (verificationChannel.type !== ChannelType.GuildText || logsChannel.type !== ChannelType.GuildText) {
			return;
		}

		// Check the command is being run in the correct place
		if (message.channel.id !== verificationChannel.id) {
			return;
		}

		// Create embeds
		const embed = new EmbedBuilder()
			.setDescription(
				'# Verification\n\nPlease verify that you are not a bot by clicking the button below. This will allow you to join the server and receive roles.\nBy pressing the button you agree to abide by all the rules of the server.'
			)
			.setColor('Blurple');

		const logEmbed = new EmbedBuilder()
			.setDescription(`<@${message.author.id}> (\`${message.author.id}\`) has setup the verification embed.`)
			.setColor('Blurple');

		// Create action row
		const button = new ButtonBuilder().setCustomId(`verify`).setLabel('Verify').setStyle(ButtonStyle.Success).setEmoji('✅');

		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

		// Send embeds
		await verificationChannel.send({ embeds: [embed], components: [actionRow] });
		await logsChannel.send({ embeds: [logEmbed] });
	}
}
