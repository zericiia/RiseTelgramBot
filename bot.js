const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");

// ============ CONFIGURATION ============

const TELEGRAM_TOKEN = process.env.TelgramToken || "";
const DISCORD_WEBHOOK = process.env.DiscordWebhook || "";

// ============ UTILITIES ============

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ============ WORD LISTS ============

let slurs = [
  "7mar",
  "baghl",
  "c r a p",
  "c.r.a.p",
  "cr@p",
  "crap",
  "cr*p",
  "d a m n",
  "d o u c h e",
  "d.a.m.n",
  "d.o.u.c.h.e",
  "d@mn",
  "d0uche",
  "damn",
  "d*mn",
  "douche",
  "d*uche",
  "hore",
  "k l b",
  "kalb",
  "kaleb",
  "khra",
  "khra2",
  "khraa",
  "klb",
  "n i g g a",
  "n!gga",
  "n1gga",
  "n*gga",
  "nigga",
  "nigger",
  "r e t a r d",
  "r.e.t.a.r.d",
  "r3tard",
  "re+ard",
  "retard",
  "r*tard",
  "s h i t",
  "s.h.i.t",
  "sh1t",
  "shit",
  "sh*t",
  "tff",
  "tfou",
  "tfu",
  "yela3n",
  "ب غ ل",
  "بغل",
  "ح م ا ر",
  "حم ار",
  "حمار",
  "خ ر ا ء",
  "خر اء",
  "خراء",
  "ك ل ب",
  "كلب",
  "لعنة",
  "وسخ",
  "يلعن",
  "يلعنك",
];

let BAD_WORDS = [
  "@ss",
  "@sshole",
  "3rass",
  "3رص",
  "a s s",
  "a s s h o l e",
  "a.s.s",
  "a.s.s.h.o.l.e",
  "a$$",
  "a$$hole",
  "a55",
  "ass",
  "assh0le",
  "asshole",
  "b a s t a r d",
  "b i t c h",
  "b!tch",
  "b.a.s.t.a.r.d",
  "b.i.t.c.h",
  "b@stard",
  "b1tch",
  "bastard",
  "biatch",
  "bitch",
  "b*stard",
  "b*tch",
  "c o c k",
  "c u n t",
  "c.o.c.k",
  "c.u.n.t",
  "c@ck",
  "c@nt",
  "c0ck",
  "c*ck",
  "chermout",
  "chermouta",
  "c*nt",
  "cock",
  "cu*t",
  "d i c k",
  "d!ck",
  "d.i.c.k",
  "d@mn",
  "d1ck",
  "d*ck",
  "dick",
  "f a g g o t",
  "f u c k",
  "f.a.g.g.o.t",
  "f.u.c.k",
  "f@ck",
  "f@ggot",
  "f4ggot",
  "faggot",
  "fck",
  "f*ck",
  "f*ggot",
  "fuck",
  "fuk",
  "fu*k",
  "m o t h e r f u c k e r",
  "m.f.",
  "m0therfucker",
  "motherfkr",
  "motherfucker",
  "motherfuker",
  "m*therf*cker",
  "n i k",
  "n k",
  "n*k",
  "nkk",
  "n*y*k",
  "p u s s y",
  "p.u.s.s.y",
  "p@ssy",
  "p*ssy",
  "pu55y",
  "pussy",
  "s l u t",
  "s.l.u.t",
  "s1ut",
  "sl*t",
  "slut",
  "t w a t",
  "t.w.a.t",
  "t1z",
  "tayes",
  "tays",
  "tiz",
  "tw@t",
  "twat",
  "tw*t",
  "w h o r e",
  "w.h.o.r.e",
  "wh0re",
  "whore",
  "wh*re",
  "ya l3an",
  "zbi",
  "zbii",
  "لقحاب",
  "ز ب",
  "ز ب ي",
  "ز ب يي",
  "زبي",
  "زبيي",
  "شر م وط ة",
  "شرموط",
  "شرموطة",
  "ط ي ز",
  "ط.ي.ز",
  "طيز",
  "ع ر ص",
  "عر ص",
  "عرص",
  "ق ح ب ة",
  "ق7ب",
  "قح بة",
  "قحب",
  "قحبة",
  "قحـبة",
  "قحبه",
  "ك ف ر",
  "كفر",
  "مك و ة",
  "مكوة",
  "ن ك",
  "ن ي ك",
  "ن.ك",
  "نك",
  "ني ك",
  "نيك",
  "نيك",
  "na9ch",
  "نقش",
  "سوة",
  "ثقبة تاعك",
  "زب",
  "ترمة",
  "ترمة تاعك",
  "زك",
  "كس",
  "قلاوي",
  "قلوة",
  "زل",
  "ازبي",
  "زبوبنا",
  "زبوبهم",
  "ترمتك",
  "زبنا",
  ,"زبوبكم"
  ,"زبها"
  ,"منقش"
];

// Filter slurs from bad words
BAD_WORDS = BAD_WORDS.filter((word) => !slurs.includes(word));

// ============ START BOT ============

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
console.log("🤖 Bot is running...");

// ============ WELCOME ============

bot.on("new_chat_members", (msg) => {
  msg.new_chat_members.forEach((user) => {
    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    axios.post(DISCORD_WEBHOOK, {
      content: `👋 **New member joined Telegram**: ${name}`,
    });
  });
});

// ============ MESSAGE HANDLER ============

bot.on("message", async (msg) => {
  try {
    const text = msg.text?.toLowerCase();
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const name = `${msg.from.first_name} ${msg.from.last_name || ""}`.trim();

    if (!text) return;

    const saidSlur = slurs.some((word) =>
      new RegExp(
        `(^|\\s|[.,!?؛،])${escapeRegex(word)}(?=$|\\s|[.,!?؛،])`,
        "i"
      ).test(text)
    );

    const saidBadWord =
      !saidSlur &&
      BAD_WORDS.some((word) =>
        new RegExp(
          `(^|\\s|[.,!?؛،])${escapeRegex(word)}(?=$|\\s|[.,!?؛،])`,
          "i"
        ).test(text)
      );

    if (!saidSlur && !saidBadWord) return;

    await bot.deleteMessage(chatId, msg.message_id).catch(console.error);

    const member = await bot.getChatMember(chatId, userId);
    const isPrivileged =
      member.status === "administrator" || member.status === "creator";

    const muteDuration = saidSlur ? 600 : 1000 * 60;
    const warningType = saidSlur ? "slur" : "bad word";
    const muteText = saidSlur ? "10 minutes" : "1000 minutes";

    const warningText = `🚫 Hello ${
      msg.from.first_name
    },\n\nWe do not support this kind of behavior in our community.\nPlease avoid using inappropriate language. ${
      isPrivileged ? "" : `You’ve been muted for ${muteText}.`
    }\nIf you believe this was a mistake, please contact the admins on Discord or Telegram.`;

    await bot
      .sendMessage(userId, warningText)
      .catch((e) =>
        console.log(
          "Couldn't send DM to user:",
          e.response?.body?.description || e.message
        )
      );

    if (isPrivileged) {
      await axios.post(DISCORD_WEBHOOK, {
        content: `⚠️ **${name}** (admin/creator) said a ${warningType}: ||${text}||. Cannot mute privileged users.`,
      });
    } else {
      const untilDate = Math.floor(Date.now() / 1000) + muteDuration;
      await bot.restrictChatMember(chatId, userId, {
        can_send_messages: false,
        until_date: untilDate,
      });

      await axios.post(DISCORD_WEBHOOK, {
        content: `🚫 **${name}** said a ${warningType}: ||${text}|| and was muted for ${muteText}.`,
      });
    }
  } catch (err) {
    console.error("⚠️ Error processing user:", err.message || err);
  }
});
