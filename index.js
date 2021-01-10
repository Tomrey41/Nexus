const Discord = require("discord.js");
const ytdl = require("ytdl-core");

const Client = new Discord.Client;

const prefix = "!";

var list = [];

Client.on("ready", () => {
    Client.user.setPresence({ activity: { name: "Développé par Tomrey", type: "PLAYING"}, status: "dnd" });
});

Client.on("guildMemberAdd", member => {
    member.guild.channels.cache.find(channel => channel.id === "794708518666108968").send(member.displayName + " à rejoint le discord.");
})

Client.on("guildMemberAdd", member => {
    member.guild.channels.cache.find(channel => channel.id === "794706054108676106").send(member.displayName + " est arrivé ! :slight_smile:");
    member.roles.add("768114162680856596");
    console.log("+1 Joueurs");
});

Client.on("guildMemberRemove", member => {
    member.guild.channels.cache.find(channel => channel.id === "794706054108676106").send(member.displayName + " à quitté le serveur ! :sob:");    
    console.log("-1 Joueurs");
});

Client.on("ready", () => {
    console.log("Bot lancé avec succès");
});


Client.on("message", async message => {
    if(message.content === prefix + "playlist"){
        let msg = "**FILE D'ATTENTE !**\n";
        for(var i = 1;i < list.length;i++){
            let name;
            await ytdl.getInfo(list[i], (err, info) => {
                if(err){
                    console.log("erreur de lien : " + err);
                    list.splice(i, 1);
                }
                else {
                    name = info.title;
                }
            });
            msg += "> " + i + " - " + name + "\n";
        }
        message.channel.send(msg);
    }
    else if(message.content.startsWith(prefix + "play")){
        if(message.member.voice.channel){
            let args = message.content.split(" ");

            if(args[1] == undefined || !args[1].startsWith("https://www.youtube.com/watch?v=")){
                message.reply("Lien de la vidéo non ou mal mentionné.");
            }
            else {
                if(list.length > 0){
                    list.push(args[1]);
                    message.reply("Musique ajouté à la liste.");
                }
                else {
                    list.push(args[1]);
                    message.reply("Musique ajouté à la liste.");

                    message.member.voice.channel.join().then(connection => {
                        playMusic(connection);

                        connection.on("disconnect", () => {
                            list = [];
                        });

                    }).catch(err => {
                        message.reply("Erreur lors de la connection contacté tomrey : " + err);
                    });
                }
            }
        }
    }
});

function playMusic(connection){
    let dispatcher = connection.play(ytdl(list[0], { quality: "highestaudio"}));

    dispatcher.on("finish",() => {
        list.shift();
        dispatcher.destroy();

        if(list.length > 0){
            playMusic(connection);
        }
        else {
            connection.disconnect();
        }
    });

    dispatcher.on("error", err => {
        console.log("Erreur de dispatcher :" + err);
        dispatcher.destroy();
        connection.disconnect
    });
}




Client.on("message", message => {
    if(message.member.permissions.has("ADMINISTRATOR")){
        if(message.content.startsWith(prefix + "clear")){
            let args = message.content.split(" ");
            

            if(args[1] == undefined){
                message.reply("Définnisez un nombre de message à supprimez Ex : !clear 12");
            }
            else {
                let number = parseInt(args[1]);

                if(isNaN(number)){
                    message.reply("Nombre de message mal défini");
                }
                else {
                    message.channel.bulkDelete(number).then(messages => {
                        console.log("Supression de " + messages.size + " Message réussie");
                        message.reply(messages.size + " message ont été supprimé.");
                    }).catch(err => {
                        console.log("Erreur de clear :" + err);
                    });
                }
            }
        }
    }
        
});


Client.on("message", message => {
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;

    if(message.member.hasPermission("ADMINISTRATOR")){
        if(message.content.startsWith(prefix + "ban")){
            let mention = message.mentions.members.first();

            if(mention == undefined){
                message.reply("Membre non ou mal mentionné veuillez réessayez.");
            }
            else {
                if(mention.bannable){
                    mention.ban();
                    message.channel.send(mention.displayName + " à été banni avec succes");
            }
            else {
                message.reply("Impossible de bannir ce membre.");
                }
            }
        }
        else if(message.content.startsWith(prefix + "kick")){
            let mention = message.mentions.members.first(); // Variable de la mention 

            if(mention == undefined){
                message.reply("Membre non ou mal mentionné."); // Si pas de mention
            }
            else {
                if(mention.kickable){
                    mention.kick();
                    message.channel.send(mention.displayName + " à bien été kick !"); // Message de kick 
                }
                else {
                    message.reply("Impossible de kick ce membre.");
                }
            }
        }
    }
});

Client.login(process.env.TOKEN) // Token du bot

