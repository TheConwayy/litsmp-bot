import { EmbedBuilder, GuildMember } from 'discord.js';
import { getEpoch } from './utils';

/**
 * Generates an embed containing information about a given user.
 * @param member - The GuildMember object to generate the embed for.
 * @returns An EmbedBuilder object containing the generated embed.
 */
export function getUserEmbed(member: GuildMember): EmbedBuilder {
	const user = member.user;

	const accountCreatedEpoch = getEpoch(user.createdAt);
	const joinedAtEpoch = getEpoch(member.joinedAt!);

	const embed = new EmbedBuilder()
		.setDescription('# User Information')
		.setThumbnail(user.displayAvatarURL())
		.addFields({ name: 'ID', value: `\`${user.id}\``, inline: true })
		.addFields({ name: 'Username', value: user.username, inline: true })
		.addFields({ name: '\u200B', value: '\u200B', inline: true })
		.addFields({ name: 'Account Created', value: `<t:${accountCreatedEpoch}:R>`, inline: true })
		.addFields({ name: 'Joined At', value: `<t:${joinedAtEpoch}:R>`, inline: true })
		.setColor('Blurple');

	return embed;
}
