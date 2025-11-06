"use client";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const page = () => {
  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
    });
  });

  return (
    <div className="mx-10 sm:mx-28 flex flex-col items-center gap-4 my-4">
      <h1 className="text-3xl" data-aos="fade-up">
        संरक्षक और संस्थापक
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
            जालिब नोमानी का वास्तविक नाम हिदायतुल्लाह है और उनका उपनाम जालिब नोमानी है।
            उनका जन्मस्थान और निवास अस्कर गंज गोरखपुर है। उन्हें अरबी, फारसी और उर्दू
            साहित्य पर महारत हासिल है। कविता उनकी वंशानुगत देन है। उनके अनगिनत शिष्य हैं
            जो कविता के क्षेत्र में अपनी उत्कृष्टता दिखा रहे हैं। उन्हें उस्ताद अल-शुअरा
            (कवियों के गुरु) का दर्जा प्राप्त है।
          </p>
          <p data-aos="fade-up" className="text-muted-foreground">
            यदि जालिब साहब की साहित्यिक और उर्दू सेवाओं की विस्तृत समीक्षा की जाए तो
            एक पूरी पुस्तक अस्तित्व में आ सकती है। उन्होंने अपने जीवन का अधिकांश भाग
            उर्दू की सेवा में बिताया है, बिना लाभ-हानि के वे इस क्षेत्र में हमेशा सक्रिय
            रहे हैं। इसके लिए उन्होंने अपने शरीर का एक-एक बूंद खून निचोड़ दिया है,
            जिसे उनकी अनुकरणीय उपलब्धि कहा जा सकता है।
          </p>
          <p data-aos="fade-up" className="text-muted-foreground">
            सबसे पहले उन्होंने नगार-ए-अदब नामक एक साहित्यिक संस्थान की स्थापना की।
            इसके अलावा वे शहर की अन्य साहित्यिक संस्थाओं और संघों जैसे अरबाब-ए-जौक,
            साहित्यिक सोसायटी, बज़्म-ए-अदब, प्रगतिशील लेखक संघ, अंजुमन तरक्की उर्दू,
            नए जावियों आदि से जुड़े रहे और पदाधिकारी रहे। उन्होंने एक सार्वजनिक पुस्तकालय
            की स्थापना की, उर्दू शाम का स्कूल खोला, और उर्दू संरक्षण आंदोलन में भाग लिया।
          </p>
          <div
            data-aos="fade-up"
            className="w-full flex items-center content-center justify-center"
          >
            <p className="text-center w-max text-muted-foreground italic">
              "हमने जुनून की खूनी कहानियां लिखते रहे <br />
              यद्यपि इस प्रक्रिया में हमारे हाथ कलम बन गए"
            </p>
          </div>
        </div>
      </div>

      <h3 data-aos="fade-up" className="text-xl text-center p-2 pb-4">
        संरक्षकगण
      </h3>

      <div
        data-aos="fade-up"
        className="flex flex-col items-center gap-4 md:flex-row-reverse md:items-start pb-1 border-b "
        id="azizsb"
      >
        <div className="photo flex flex-col gap-1 border rounded-md overflow-hidden text-center mb-4 max-w-[300px] md:w-[600px]">
          <div className="photowrapper overflow-hidden">
            <img
              height={1500}
              width={1200}
              className="rounded-t-md object-cover transition-all ease-in-out hover:scale-110"
              src="/founders/aziz.jpg"
              alt="aziz sb"
            />
          </div>
          <h3 className="text-2xl text-center p-2">डॉ. अज़ीज़ अहमद</h3>
        </div>
        <div className="details" dir="ltr">
          <div className="details leading-8 text-justify" dir="ltr">
            <p data-aos="fade-up" className="text-muted-foreground">
              डॉ. अज़ीज़ अहमद एम.डी., मुस्लिम विश्वविद्यालय के स्नातक, एक व्यापक,
              प्रभावशाली और आकर्षक व्यक्तित्व के स्वामी हैं। उनके व्यक्तित्व का एक
              महत्वपूर्ण घटक सुलह है। उनकी शानदार पारिवारिक पृष्ठभूमि है, कविता की
              असाधारण समझ, अतुलनीय स्मृति, और बेजोड़ बुद्धि और नब्ज़ पहचानने की क्षमता है।
            </p>
            <p data-aos="fade-up" className="text-muted-foreground">
              उन्होंने सैकड़ों छंद और कविताएं याद की हैं, जिनका उपयोग वे भाषणों के
              दौरान उचित और समयानुकूल करते रहते हैं। वे अहमद अस्पताल अबू बाज़ार अंचोआ
              के संस्थापक और स्वामी हैं। इससे सटा हुआ उनका शानदार निवास है। वे अत्यंत
              दयालु, धैर्यवान और हास्यप्रिय हैं। उर्दू भाषा और कविता के लिए उनकी
              सेवाएं हमेशा याद रखी जाएंगी।
            </p>
            <div
              data-aos="fade-up"
              className="w-full flex items-center content-center justify-center"
            >
              <p className="text-center w-max text-muted-foreground italic">
                "जो दिल पर गुज़रती है हम लिखते रहेंगे <br />
                हम तख्ती और कलम का पालन-पोषण करते रहेंगे"
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
              महबूब सईद हारिस गोरखपुर शहर के प्रसिद्ध लेखक, कवि और सम्मानित सैयद
              हामिद अली गुलशन काज़ी पुर खुर्द के पुत्र हैं। सम्मानित व्यक्तियों में
              उन्हें एक महत्वपूर्ण स्थान प्राप्त था। उन्होंने अपने निवास में एक
              पुस्तकालय स्थापित किया था जिसमें आज भी बहुत दुर्लभ और बहुमूल्य पुस्तकें मौजूद हैं।
            </p>
            <p data-aos="fade-up" className="text-muted-foreground">
              हारिस साहब के दादा सैयद साजिद अली एडवोकेट एक विशेषज्ञ वकील और अनुभवी
              कवि थे। महबूब सईद हारिस ने गोरखपुर विश्वविद्यालय से उर्दू में पीएचडी की है।
              उनके व्यक्तित्व के निर्माण में उनके पिता और दादा के काव्य रुचि और सेवा
              भावना ने बहुत महत्वपूर्ण भूमिका निभाई है। यही कारण है कि मानवता की सेवा
              उनकी नसों में खून की तरह दौड़ रही है।
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
          <h3 className="text-2xl text-center p-2">मोहम्मद अनवर ज़िया</h3>
        </div>
        <div className="details" dir="ltr">
          <div className="details leading-8 text-justify" dir="ltr">
            <p data-aos="fade-up" className="text-muted-foreground">
              अनवर ज़िया - इस्माइलपुर गोरखपुर के प्रसिद्ध धर्मगुरु, क़ारी और प्रचारक
              रहमतुल्लाह साहब (स्वर्गीय) के योग्य पुत्र, उर्दू में एम.ए. हैं। वे उर्दू
              के विश्वसनीय विद्वान, कवि और लेखक हैं, छंदशास्त्र की कला में विशेषज्ञता
              रखते हैं। वे इस्लामिया कॉलेज की प्रबंध समिति के सदस्य और अंजुमन इस्लामिया
              खूनीपुर के जिम्मेदार पदाधिकारी हैं।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;