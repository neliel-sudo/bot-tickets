const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    ChannelType,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events,
    SlashCommandBuilder,
    REST,
    Routes
} = require('discord.js');

// ==========================
// CLIENTE
// ==========================

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ==========================
// CONFIGURACIÓN
// ==========================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ==========================
// ROLES STAFF
// ==========================

const STAFF_EVENTOS = 'I1435353402002374745';
const STAFF_SUGERENCIAS = '1435353402002374745';

// ==========================
// CATEGORÍAS
// ==========================

const CATEGORIA_EVENTOS = '1505945637513068574';
const CATEGORIA_SUGERENCIAS = '1505945637513068574';

// ==========================
// SLASH COMMAND /panel
// ==========================

const commands = [
    new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Enviar panel de tickets')
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {

        await rest.put(
            Routes.applicationGuildCommands(
                CLIENT_ID,
                GUILD_ID
            ),
            { body: commands }
        );

        console.log('✅ Slash command registrado.');

    } catch (error) {
        console.error(error);
    }
})();

// ==========================
// BOT READY
// ==========================

client.once(Events.ClientReady, () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

// ==========================
// INTERACCIONES
// ==========================

client.on(Events.InteractionCreate, async interaction => {

    // ==========================
    // COMANDO /panel
    // ==========================

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'panel') {

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🎫 TICKETS LSC')
                .setDescription(`
> Selecciona una opción del menú desplegable para abrir un ticket.

━━━━━━━━━━━━━━━━━━

🎈 **Eventos**  
> Abrir ticket relacionado con eventos.

📢 **Sugerencias**  
> Enviar sugerencias o feedback.

━━━━━━━━━━━━━━━━━━
                `)
                .setThumbnail(interaction.guild.iconURL())
                .setFooter({
                    text: 'LSC • Sistema de Tickets'
                })
                .setTimestamp();

            const menu = new StringSelectMenuBuilder()
                .setCustomId('tickets_menu')
                .setPlaceholder('Haz una selección')
                .addOptions([
                    {
                        label: 'Eventos',
                        description: 'Abrir ticket de eventos',
                        value: 'eventos',
                        emoji: '🎈'
                    },
                    {
                        label: 'Sugerencias',
                        description: 'Enviar sugerencias',
                        value: 'sugerencias',
                        emoji: '📢'
                    }
                ]);

            const row = new ActionRowBuilder()
                .addComponents(menu);

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }
    }

    // ==========================
    // MENÚ TICKETS
    // ==========================

    if (interaction.isStringSelectMenu()) {

        const opcion = interaction.values[0];

        const cerrar = new ButtonBuilder()
            .setCustomId('cerrar_ticket')
            .setLabel('Cerrar Ticket')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger);

        const botones = new ActionRowBuilder()
            .addComponents(cerrar);

        // ==========================
        // EVENTOS
        // ==========================

        if (opcion === 'eventos') {

            const canal = await interaction.guild.channels.create({
                name: `🎈-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: CATEGORIA_EVENTOS,

                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ]
                    },
                    {
                        id: STAFF_EVENTOS,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ]
                    }
                ]
            });

            const embedEvento = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🎈 Ticket de Eventos')
                .setDescription(`
Hola ${interaction.user}

Gracias por abrir un ticket de eventos.

Un miembro del staff te atenderá pronto.
                `)
                .setFooter({
                    text: 'LSC • Eventos'
                })
                .setTimestamp();

            await canal.send({
                embeds: [embedEvento],
                components: [botones]
            });

            await interaction.reply({
                content: `✅ Ticket creado: ${canal}`,
                ephemeral: true
            });
        }

        // ==========================
        // SUGERENCIAS
        // ==========================

        if (opcion === 'sugerencias') {

            const canal = await interaction.guild.channels.create({
                name: `📢-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: CATEGORIA_SUGERENCIAS,

                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ]
                    },
                    {
                        id: STAFF_SUGERENCIAS,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ]
                    }
                ]
            });

            const embedSug = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('📢 Ticket de Sugerencias')
                .setDescription(`
Hola ${interaction.user}

Gracias por enviarnos tu sugerencia.
                `)
                .setFooter({
                    text: 'LSC • Sugerencias'
                })
                .setTimestamp();

            await canal.send({
                embeds: [embedSug],
                components: [botones]
            });

            await interaction.reply({
                content: `✅ Ticket creado: ${canal}`,
                ephemeral: true
            });
        }
    }

    // ==========================
    // BOTÓN CERRAR
    // ==========================

    if (interaction.isButton()) {

        if (interaction.customId === 'cerrar_ticket') {

            await interaction.reply({
                content: '🔒 Cerrando ticket en 5 segundos...'
            });

            setTimeout(() => {
                interaction.channel.delete();
            }, 5000);
        }
    }
});

// ==========================
// LOGIN
// ==========================

client.login(TOKEN);
