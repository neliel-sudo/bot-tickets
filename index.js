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

/* =========================
   VARIABLES (RAILWAY)
========================= */

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

/* =========================
   DEBUG
========================= */

console.log('--- DEBUG VARIABLES ---');
console.log('TOKEN existe:', !!TOKEN);
console.log('CLIENT_ID:', CLIENT_ID);
console.log('GUILD_ID:', GUILD_ID);
console.log('-----------------------');

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.log('❌ ERROR: faltan variables de entorno');
    process.exit(1);
}

/* =========================
   CLIENT
========================= */

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

/* =========================
   CONFIG
========================= */

// ROL STAFF
const STAFF_EVENTOS = '1435353402002374745';
const STAFF_SUGERENCIAS = '1435353402002374745';

// CATEGORÍAS
const CATEGORIA_EVENTOS = '1505945637513068574';
const CATEGORIA_SUGERENCIAS = '1505945637513068574';

/* =========================
   CONTADORES
========================= */

let contadorEventos = 1;
let contadorSugerencias = 1;

/* =========================
   SLASH COMMANDS
========================= */

const commands = [
    new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Abrir panel de tickets')
        .toJSON()
];

/* =========================
   REGISTER COMMANDS
========================= */

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

/* =========================
   READY
========================= */

client.once(Events.ClientReady, () => {

    console.log(`✅ Bot conectado como ${client.user.tag}`);

});

/* =========================
   INTERACCIONES
========================= */

client.on(Events.InteractionCreate, async (interaction) => {

    /* =========================
       COMANDO /panel
    ========================= */

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'panel') {

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🎫┊Sistema de Tickets')
                .setDescription(`
Selecciona el ticket que deseas abrir.

🎈┊Eventos
📢┊Sugerencias
                `)
                .setFooter({ text: 'LSC Tickets System' })
                .setTimestamp();

            const menu = new StringSelectMenuBuilder()
                .setCustomId('menu_tickets')
                .setPlaceholder('🎫┊Selecciona un ticket')
                .addOptions([
                    {
                        label: '🎈┊Eventos',
                        value: 'eventos',
                        description: 'Relacionado con eventos'
                    },
                    {
                        label: '📢┊Sugerencias',
                        value: 'sugerencias',
                        description: 'Ideas y opiniones'
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(menu);

            return interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }
    }

    /* =========================
       MENÚ TICKETS
    ========================= */

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId !== 'menu_tickets') return;

        const opcion = interaction.values[0];

        const botonCerrar = new ButtonBuilder()
            .setCustomId('cerrar')
            .setLabel('🔒┊Cerrar Ticket')
            .setStyle(ButtonStyle.Danger);

        const rowBoton = new ActionRowBuilder().addComponents(botonCerrar);

        let canal;
        let ticketEmbed;

        /* =========================
           🎈 EVENTOS
        ========================= */

        if (opcion === 'eventos') {

            const nombreTicket = `🎈┊eventos-${String(contadorEventos).padStart(4, '0')}`;

            canal = await interaction.guild.channels.create({
                name: nombreTicket,
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

            contadorEventos++;

            ticketEmbed = new EmbedBuilder()
                .setColor('#ff69b4')
                .setTitle('🎈┊Ticket de Eventos')
                .setDescription(`
Bienvenido ${interaction.user}

Este ticket es para:

🎈┊Eventos para realizar
🎈┊Participaciones
🎈┊Consultas generales
                `)
                .setFooter({ text: 'LSC Tickets System' })
                .setTimestamp();
        }

        /* =========================
           📢 SUGERENCIAS
        ========================= */

        if (opcion === 'sugerencias') {

            const nombreTicket = `📢┊sugerencias-${String(contadorSugerencias).padStart(4, '0')}`;

            canal = await interaction.guild.channels.create({
                name: nombreTicket,
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

            contadorSugerencias++;

            ticketEmbed = new EmbedBuilder()
                .setColor('#00b0f4')
                .setTitle('📢┊Ticket de Sugerencias')
                .setDescription(`
Bienvenido ${interaction.user}

Este ticket es para:

📢┊Ideas nuevas
📢┊Opiniones
                `)
                .setFooter({ text: 'LSC Tickets System' })
                .setTimestamp();
        }

        /* =========================
           ENVIAR MENSAJE
        ========================= */

        if (canal) {

            await canal.send({
                content: `${interaction.user}`,
                embeds: [ticketEmbed],
                components: [rowBoton]
            });

            return interaction.reply({
                content: `✅┊Tu ticket fue creado correctamente: ${canal}`,
                ephemeral: true
            });
        }
    }

    /* =========================
       BOTONES
    ========================= */

    if (interaction.isButton()) {

        /* =========================
           BOTÓN CERRAR
        ========================= */

        if (interaction.customId === 'cerrar') {

            const confirmar = new ButtonBuilder()
                .setCustomId('confirmar_cierre')
                .setLabel('✅ Confirmar')
                .setStyle(ButtonStyle.Danger);

            const cancelar = new ButtonBuilder()
                .setCustomId('cancelar_cierre')
                .setLabel('❌ Cancelar')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(confirmar, cancelar);

            return interaction.reply({
                content: '¿Seguro que deseas cerrar el ticket?',
                components: [row],
                ephemeral: true
            });
        }

        /* =========================
           CANCELAR
        ========================= */

        if (interaction.customId === 'cancelar_cierre') {

            return interaction.update({
                content: '✅ Acción cancelada.',
                components: []
            });
        }

        /* =========================
           CONFIRMAR CIERRE
        ========================= */

        if (interaction.customId === 'confirmar_cierre') {

            const miembro = interaction.member;

            const esStaff =
                miembro.roles.cache.has(STAFF_EVENTOS) ||
                miembro.roles.cache.has(STAFF_SUGERENCIAS);

            /* =========================
               STAFF -> ELIMINA
            ========================= */

            if (esStaff) {

                await interaction.update({
                    content: '🔒 Ticket eliminado.',
                    components: []
                });

                setTimeout(() => {

                    interaction.channel.delete().catch(() => {});

                }, 3000);

                return;
            }

            /* =========================
               USUARIO -> OCULTAR
            ========================= */

            await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
                ViewChannel: false,
                SendMessages: false
            });

            await interaction.channel.send({
                content: `🔒 El usuario ${interaction.user} ha cerrado el ticket.\nEl staff aún puede verlo y eliminarlo cuando termine.`
            });

            return interaction.update({
                content: '✅ Has cerrado tu ticket correctamente.',
                components: []
            });
        }
    }
});

/* =========================
   LOGIN
========================= */

client.login(TOKEN);
