require('dotenv').config();

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
// VARIABLES
// ==========================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ==========================
// DEBUG CRÍTICO (NO BORRAR)
// ==========================

console.log('--- DEBUG VARIABLES ---');
console.log('TOKEN existe:', !!TOKEN);
console.log('CLIENT_ID:', CLIENT_ID);
console.log('GUILD_ID:', GUILD_ID);
console.log('-----------------------');

// Si algo falla, paramos aquí
if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.log('❌ ERROR: faltan variables de entorno');
    process.exit(1);
}

// ==========================
// CLIENT
// ==========================

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ==========================
// CONFIG
// ==========================

const STAFF_EVENTOS = '1435353402002374745';
const STAFF_SUGERENCIAS = '1435353402002374745';

const CATEGORIA_EVENTOS = '1505945637513068574';
const CATEGORIA_SUGERENCIAS = '1505945637513068574';

// ==========================
// SLASH COMMANDS
// ==========================

const commands = [
    new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Abrir panel de tickets')
        .toJSON()
];

// ==========================
// REST (REGISTRO COMANDOS)
// ==========================

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🔄 Registrando comandos...');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log('✅ Comandos registrados');
    } catch (err) {
        console.error('❌ ERROR registrando comandos:', err);
    }
})();

// ==========================
// READY
// ==========================

client.once(Events.ClientReady, () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

// ==========================
// INTERACCIONES
// ==========================

client.on(Events.InteractionCreate, async (interaction) => {

    // /panel
    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'panel') {

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🎫 TICKETS')
                .setDescription('Selecciona una opción');

            const menu = new StringSelectMenuBuilder()
                .setCustomId('menu_tickets')
                .setPlaceholder('Selecciona una opción')
                .addOptions([
                    { label: 'Eventos', value: 'eventos', emoji: '🎈' },
                    { label: 'Sugerencias', value: 'sugerencias', emoji: '📢' }
                ]);

            return interaction.reply({
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(menu)]
            });
        }
    }

    // MENÚ
    if (interaction.isStringSelectMenu()) {

        const opcion = interaction.values[0];

        const boton = new ButtonBuilder()
            .setCustomId('cerrar')
            .setLabel('Cerrar ticket')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(boton);

        let canal;

        if (opcion === 'eventos') {
            canal = await interaction.guild.channels.create({
                name: `🎈-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: CATEGORIA_EVENTOS,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
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
        }

        if (opcion === 'sugerencias') {
            canal = await interaction.guild.channels.create({
                name: `📢-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: CATEGORIA_SUGERENCIAS,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
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
        }

        if (canal) {
            await canal.send({
                content: `Ticket creado por ${interaction.user}`,
                components: [row]
            });

            return interaction.reply({
                content: `✅ Ticket creado: ${canal}`,
                ephemeral: true
            });
        }
    }

    // BOTÓN
    if (interaction.isButton()) {

        if (interaction.customId === 'cerrar') {

            await interaction.reply('🔒 Cerrando ticket...');

            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 3000);
        }
    }
});

// ==========================
// LOGIN
// ==========================

client.login(TOKEN);
