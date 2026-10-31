"use client";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
const page = () => {
  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      // duration: 300,
    });
  });
  return (
    <div className="mx-10 sm:mx-28 flex flex-col items-center gap-4 my-4">
      <h1 className="text-3xl" data-aos="fade-up">
        सरपरस्त व बानी
      </h1>
      <div
        className="flex flex-col items-center gap-4 md:flex-row-reverse md:items-start pb-1 border-b "
        id="jalibSb"
      >
        <div
          data-aos="fade-up"
          className="photo flex flex-col gap-1 border rounded-md overflow-hidden text-center mb-4 max-w-[300px] md:w-[600px]"
        >
          <div className="photowrapper overflow-hidden">
            <img
              height={1500}
              width={1200}
              className="rounded-t-md object-cover transition-all ease-in-out hover:scale-110"
              src="/founders/jalib.jpg"
              alt="jalib sb"
            />
          </div>
          <h3 className="text-2xl text-center p-2">जालिब नोमानी</h3>
        </div>
        <div className="details leading-8 text-justify" dir="ltr">
          <p data-aos="fade-up" className="text-muted-foreground">
            जालिब नोमानी का ज़ाती नाम हिदायतुल्लाह और सिफ़ाती नाम जालिब नोमानी। मौलिद व
            मसकन अस्कर गंज गोरखपुर है। उन्हें अदबियात अरबी फ़ारसी और उर्दू पर उबूर
            हासिल है। शायरी उनकी ख़ाना-ज़ाद है। उनके ला-तादाद शागिर्द हैं जो मैदान-ए
            शायरी में अपना कमाल दिखा रहे हैं उन्हें उस्तादुश-शोअरा का दर्जा हासिल
            है। जालिब साहब की अदबी और उर्दू ख़िदमात का तफ़सीली जायज़ा लिया जाए तो एक
            मुकम्मल किताब वजूद में आ सकती है। उर्दू की ख़िदमत में उन्होंने अपनी ज़िंदगी
            का बेशतर हिस्सा सर्फ़ कर दिया, बग़ैर मुनाफ़अत और सूद-ओ-ज़ियाँ वह इस मैदान में
            हमेशा सरगर्म रहे हैं इसके लिए उन्होंने अपने जिस्म का एक-एक क़तरा लहू
            निचोड़ दिया है इसे उनका एक मिसाली कारनामा कहा जा सकता है।
          </p>
          <p data-aos="fade-up" className="text-muted-foreground">
            सबसे पहले उन्होंने एक अदबी इदारा निगार-ए-अदब क़ायम किया, इसके अलावा
            शहर के दीगर अदबी इदारों और अंजुमनों मसलन अरबाब-ए-ज़ौक़, अदबी सोसाइटी,
            बज़्म-ए-अदब, अंजुमन-ए-तरक़्क़ी-पसंद मुसन्निफ़ीन, अंजुमन-ए-तरक़्क़ी उर्दू, नए ज़ाविए वग़ैरह
            से ताल्लुक़ रखा और ओहदेदार रहे। अवामी लाइब्रेरी क़ायम की, उर्दू शबीना
            स्कूल खोला, उर्दू मुहाफ़िज़-दस्ता की तहरीक में शामिल रहे इसके लिए उन्होंने
            कलेक्ट्रेट में जो भूख हड़ताल हुई उसमें भी शरीक रहे, कुछ अदबी और
            दीनी रिसालों की मजलिस-ए-इदारत में रहकर अपने क़लम से जौहर दिखाते रहे। जालिब
            साहब की इन बेमिसाल ख़िदमात की सताइश और एतिराफ़ मुख़्तलिफ़ इदारों ने एजाज़ात
            से नवाज़ा, अवार्ड दिए, जैसे अंजुमन तरक़्क़ी उर्दू अवार्ड, मौलवी एहसानुल्लाह
            अब्बासी अवार्ड, प्रोफ़ेसर अफ़ग़ानुल्लाह ख़ाँ अवार्ड, एम कोठियावी राही
            अवार्ड, मधुमधकर सम्मान, शमा-ए-अदब अवार्ड, फ़ख़रुद्दीन अली अहमद अवार्ड,
            हिंदी गोरखपुरी अवार्ड वग़ैरह। मौजूदा वक़्त में अरबाब-ए-सुख़न गोरखपुर और
            "जहाँ नुमा" के बानी व सरपरस्त हैं।
          </p>
          <div
            data-aos="fade-up"
            className="w-full flex items-center content-center justify-center"
          >
            <p className="text-center w-max text-muted-foreground">
              लिखते रहे जुनूँ की हिकायात ख़ूँचकाँ <br />
              हर चंद इस में हाथ हमारे क़लम हुए{" "}
            </p>
          </div>
        </div>
      </div>
      <h3 data-aos="fade-up" className="text-xl text-center p-2 pb-4">
        सरपरस्त हज़रात
      </h3>
      <div
        data-aos="fade-up"
        className="flex flex-col items-center gap-4 md:flex-row-reverse md:items-start pb-1 border-b "
        id="azizsb"
      >
        <div className="photo flex flex-col  gap-1 border rounded-md overflow-hidden text-center mb-4 max-w-[300px] md:w-[600px]">
          <div className="photowrapper overflow-hidden">
            <img
              height={1500}
              width={1200}
              className="rounded-t-md object-cover transition-all ease-in-out hover:scale-110"
              src="/founders/aziz.jpg"
              alt="aziz sb"
            />
          </div>
          <h3 className="text-2xl text-center p-2">डॉक्टर अज़ीज़ अहमद</h3>
        </div>
        <div className="details" dir="ltr">
          <div className="details leading-8 text-justify" dir="ltr">
            <p data-aos="fade-up" className="text-muted-foreground">
              डॉक्टर अज़ीज़ अहमद एम.डी. मुस्लिम यूनिवर्सिटी के फ़ैज़याफ़्ता एक जामेअ असर
              -अंगेज़ और दिलनवाज़ शख़्सियत के मालिक हैं। उनकी शख़्सियत का एक अहम जुज़्व सुल्ह-ए
              कुल है। शानदार ख़ानदानी पस-ए-मंज़र रखते हैं। शेर-फ़हमी ग़ज़ब की, याददाश्त
              बेमिसाल, ज़कावत और नब्ज़-शनासी ला-जवाब है। सैकड़ों अशआर और नज़्में
              हिफ़्ज़ हैं, जिनका इस्तेमाल दौरान-ए-ख़िताबत (तक़रीर) बरजस्ता और बरमहल करते
              रहते हैं।
            </p>
            <p data-aos="fade-up" className="text-muted-foreground">
              अहमद हॉस्पिटल अबू बाज़ार इंचुआ के बुनियादकार और मालिक हैं। इसी से मुत्तसिल
              उनकी शानदार रिहाइशगाह है। इंतिहाई शफ़ीक़, बर्दबार और बुज़ला-संज हैं।
              उर्दू ज़बान और शेर-ओ-अदब के लिए उनकी ख़िदमात हमेशा याद रखी जाएँगी।
              उनकी शख़्सियत के हमारंग पहलुओं को उजागर करने के लिए ज़ेल का शेर बहुत
              मौज़ूँ और हस्ब-ए-हाल है।
            </p>
            <div
              data-aos="fade-up"
              className="w-full flex items-center content-center justify-center"
            >
              <p className="text-center w-max text-muted-foreground">
                जो दिल पे गुज़रती है रक़म करते रहेंगे <br />
                हम परवरिश-ए-लौह-ओ-क़लम करते रहेंगे{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col items-center gap-4 md:flex-row-reverse md:items-start pb-1 border-b "
        id="harissb"
      >
        <div
          data-aos="fade-up"
          className="photo flex flex-col gap-1 border rounded-md overflow-hidden text-center mb-4 max-w-[300px] md:w-[600px]"
        >
          <div className="photowrapper overflow-hidden">
            <img
              height={1500}
              width={1200}
              className="rounded-t-md object-cover transition-all ease-in-out hover:scale-110"
              src="/founders/haris.jpeg"
              alt="haris sb"
            />
          </div>
          <h3 className="text-2xl text-center p-2">महबूब सईद हारिस</h3>
        </div>
        <div className="details" dir="ltr">
          <div className="details leading-8 text-justify" dir="ltr">
            <p data-aos="fade-up" className="text-muted-foreground">
              महबूब सईद हारिस शहर गोरखपुर के मशहूर अदीब-ओ-शायर और रईस सैयद
              हामिद अली गुलफ़शाँ क़ाज़ीपुर ख़ुर्द के साहबज़ादे हैं। मुअज़्ज़िज़ीन में उन्हें एक
              अहम मक़ाम हासिल था। उन्होंने अपनी रिहाइशगाह में एक लाइब्रेरी क़ायम
              कर रखी थी जिसमें बहुत ही नादिर-ओ-नायाब किताबें आज भी मौजूद हैं।
              हारिस साहब के दादा सैयद साजिद अली एडवोकेट एक माहिर क़ानूनदाँ और
              कहन-मश्क़ शायर थे। उनकी ग़ज़ल के एक मिसरे (हम उड़ना चाहते थे आशियाँ
              से) पर साजिद अली मेमोरियल कमेटी के ज़ेरे-एहतिमाम हामिद अली हॉल घासी
              कटरा में एक तरह़ी शायरी इनामी नशिस्त मुनअक़िद हो चुकी है। यह शायरी नशिस्त
              महबूब सईद हारिस के ज़ेहनी तनव्वो की ज़िंदा मिसाल है।
            </p>
            <p data-aos="fade-up" className="text-muted-foreground">
              महबूब सईद हारिस गोरखपुर यूनिवर्सिटी से उर्दू में पीएचडी हैं। उनकी
              शख़्सियत की तामीर में वालिद और दादा के ज़ौक़-ए-सुख़नवरी और जज़्बा-ए-ख़िदमत ने
              बहुत अहम रोल अदा किया है। यही वजह है कि ख़िदमत-ए-ख़ल्क़ उनकी रगों में लहू बन
              कर दौड़ रही है। उन्होंने साजिद अली मेमोरियल कमेटी क़ायम करके ख़िदमात का
              जो सिलसिला शुरू किया है वह मिसाली है और क़ाबिल-ए-तहसीन भी। उर्दू ज़बान में
              उनकी मसाई-ए-जमीला के साथ ही तालीमी मैदान भी ज़ेरे-क़दम है। मियाँ
              साहब इंटरमीडिएट कॉलेज के एक फ़आल मैनेजर के साथ गोरखपुर के मशहूर
              दीनी इदारे अंजुमन इस्लामिया के ज़िम्मेदार और ओहदेदार भी हैं। सबसे
              खुले दिल से मिलना, दिलजोई करना उनका मसलक-ओ-मशरब है।
            </p>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col items-center gap-4 md:flex-row-reverse md:items-start pb-1 border-b "
        id="ziyasb"
      >
        <div
          data-aos="fade-up"
          className="photo flex flex-col gap-1 border rounded-md overflow-hidden text-center max-w-[300px] md:w-[600px]"
        >
          <div className="photowrapper overflow-hidden">
            <img
              height={1500}
              width={1200}
              className="rounded-t-md object-cover transition-all ease-in-out hover:scale-110"
              src="/founders/anwar-ziya.jpg"
              alt="ziya sb"
            />
          </div>
          <h3 className="text-2xl text-center p-2">मुहम्मद अनवर ज़िया</h3>
        </div>
        <div className="details" dir="ltr">
          <div className="details leading-8 text-justify" dir="ltr">
            <p data-aos="fade-up" className="text-muted-foreground">
              अनवर ज़िया — मशहूर आलिम-ए-दीन, क़ारी और मुबल्लिग़ रहमतुल्लाह साहब मरहूम
              (इस्माईलपुर गोरखपुर) के लायक़ फ़रज़ंद और उर्दू से एम.ए. हैं। उर्दू
              के मोतबर स्कॉलर, शायर और अदीब हैं। फ़न-ए-अरूज़ पर उन्हें दस्तरस हासिल
              है। इस्लामिया कॉलेज की मैनेजिंग कमेटी के रुक्न और अंजुमन इस्लामिया खूनी
              पुर के एक ज़िम्मेदार ओहदेदार हैं। ख़ुश-मिज़ाजी और सुख़न-शनासी उनकी सरिश्त
              में दाख़िल है। अदबी रिसालों में उनका कलाम शाया होता रहता है। ऑल इंडिया
              रेडियो और दूरदर्शन गोरखपुर से भी उनकी नस्री और शेरी तख़्लीक़ात नश्र
              होती रहती हैं। उर्दू ज़बान के फ़रोग़ के लिए भी उनकी कोशिश जारी-ओ-सारी
              है। गोरखपुर के मशहूर इदारे अरबाब-ए-सुख़न के जनरल सेक्रेटरी हैं। इसके
              अलावा उर्दू अकादमी उत्तर प्रदेश के 2009 से 2011 (3 साल) तक मेंबर भी
              रहे।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;