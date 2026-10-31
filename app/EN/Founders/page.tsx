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
    <div className="mx-10 sm:mx-28 flex flex-col items-center gap-4 my-4" dir="ltr">
      <h1 className="text-3xl" data-aos="fade-up">
        Sarparast o Bani
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
          <h3 className="text-2xl text-center p-2">Jalib Na'mani</h3>
        </div>
        <div className="details leading-8 text-justify">
          <p data-aos="fade-up" className="text-muted-foreground">
            Jalib Na'mani ka zaati naam Hidayatullah aur sifati naam Jalib Na'mani. Maulad o maskan Askar Ganj Gorkhpur hai. Unhein adabiat Arabi, Farsi aur Urdu par ubur haasil hai. Shaairi unki khana zaad hai. Unke la tadaad shagird hain jo maidan-e shaairi mein apna kamal dikhah rahe hain unhein ustad al-shu'ara ka darja haasil hai. Jalib sahab ki adabi aur Urdu khidmaat ka tafseeli jaiza liya jaye to ek mukammal kitaab wujood mein aa sakti hai. Urdu ki khidmat mein unhon ne apni zindagi ka baaqi hissa sirf kar diya, baghair munfa'at aur sood o ziyan wo is maidan mein hamesha sargarm rahe hain iske liye unhon ne apne jism ka ek ak qatra lahoo nichod diya hai ise unka ek misaali kaarnama kaha ja sakta hai.
          </p>
          <p data-aos="fade-up" className="text-muted-foreground">
            Sab se pehle unhon ne ek adabi idara, nagar-e adab qaim kiya, iske alawa shehar ke digar adabi idaron aur anjumanon misal-e Arbab Zauq, adabi society, bazm-e adab, anjuman-e taraqqi pasand musannifeen, anjuman-e taraqqi Urdu, naye zaviye waghera se talluq rakha aur ahdaaar rahe. Awami library qaim ki, Urdu shabeena school khola, Urdu muhafiz-e dasta ki tehreek mein shamil rahe; iske liye unhon ne kollektiv mein jo bhook hartaal hui usmein bhi shareek rahe, kuch adabi o dini rasail ki majlis-e-udart mein reh kar apne qalam se johar dikhate rahe. Jalib sahab ki in be misaal khidmaat ki sataish aur aitiraaf mukhtalif idaron ne aazazat se nawaza, awards diye, jaise anjuman taraqqi Urdu award, Maulvi Ehsan Allah Abbasi award, Professor Afghan Allah Khan award, M. Kotiawi Rahi award, Madhumadhkar Samaan, Shama-e-Adab award, Fakhruddin Ali Ahmad award, Hindi Gorkhopuri award waghera; maujooda waqt mein Arbab-e Sukhan Gorkhpur aur "Jahan Numa" ke bani o sarparast hain.
          </p>
          <div className="w-full text-center">
            <p className="inline-block w-max text-muted-foreground">
              Likhtay rahe junoon ki hikayat khoonchakan <br />
              Har chand is mein haath hamare qalam hue{" "}
            </p>
          </div>
        </div>
      </div>
      <h3 data-aos="fade-up" className="text-xl text-center p-2 pb-4">
        Sarparast Hazraat
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
          <h3 className="text-2xl text-center p-2">Doctor Aziz Ahmad</h3>
        </div>
        <div className="details" dir="ltr">
          <div className="details leading-8 text-justify" dir="ltr">
            <p data-aos="fade-up" className="text-muted-foreground">
              Doctor Aziz Ahmad M - D Muslim University ke faiz yafta ek jaam' asar angaiz aur dilnawaz shakhsiyat ke maalik hain. Unki shakhsiyat ka ek aham juz salih kulla hai shandar khandani pas-e-manzar rakhte hain. Shaer fahmi ghazab ki, yaad daas be misaal, zekavat aur nabz-e-shinasi la jawab hai, sekron ashaar aur nazmein hifz hain, jo istamal daroon-e khitabat (taqreer) barjasta aur barmahal karte rehte hain.
            </p>
            <p data-aos="fade-up" className="text-muted-foreground">
              Ahmad Hospital Abu Bazaar Ancha ke buniyaad kaar aur maalik hain. Isi se mutasil unki shandar rahishgah hai, intehai, shafeeq, bardabar aur bazla sanj hain. Urdu zaban aur sher o adab ke liye unki khidmaat hamesha yaad rakhi jayengi.
            </p>
            <div className="w-full text-center">
              <p className="inline-block w-max text-muted-foreground">
                Jo dil pe guzarti hai raqam karte rahenge <br />
                Hum parwarish-e loh o qalam karte rahenge{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col items-center gap-4 md:flex-row-reverse md:items-start pb-1 border-b "
        id="harissb"
      >
        <div>
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
            <h3 className="text-2xl text-center p-2">Mahboob Saeed Haris</h3>
          </div>
          <div className="details" dir="ltr">
            <div className="details leading-8 text-justify" dir="ltr">
              <p data-aos="fade-up" className="text-muted-foreground">
                Mahboob Saeed Haris shehar Gorkhpur ke mashhoor adeeb o shaair aur raees Sayyid Hamid Ali Gulfshan Qazi Pur Khurd ke sahabzadah hain, muazzin mein unhein ek aham maqam haasil tha. Unhone apni raheeshgah mein ek library qaim rakhi thi jismein bohat hi naadir o naayaab kitaabein aaj bhi mojood hain. Haris sahab ke dada Sayyid Sajid Ali advocate ek maahir qanoon daan aur kahna mashq shaair the. Unki ghazal ke ek misray (hum udna chahtay the aashiyan se) par Sajid Ali memorial committee ke zair-e ehtemaam Hamid Ali Hall ghasi katora mein ek tarahi shaairi inaam baithak mun'aqid ho chuki hai. Yeh shaairi baithak Mahboob Saeed Haris ke zehni tanawwu ki zinda misaal hai.
              </p>
              <p data-aos="fade-up" className="text-muted-foreground">
                Mahboob Saeed Haris Gorkhpur University se Urdu mein PhD hain, unki shakhsiyat ki tameer mein walid aur dada ke zauq-e-sukhanvari aur jazbe-e-khidmat ne bohat aham role ada kiya hai. Isi wajah se khidmat-e khalq unki ragoon mein lahoo ban kar daur rahi hai. Unhone Sajid Ali memorial committee qaim kar ke khidmaat ka silsilah shuru kiya hai jo misaali hai aur qabil-e-tahseen bhi. Urdu zaban mein unki masa'i Jameela ke sath hi taleemi maidan bhi zer-e-qadam hai, Mian sahab inter mediat college ke ek fa'al manager ke sath Gorkhpur ke mashhoor dini idare Anjuman Islamia ke zimmedar aur ahdeedaar bhi hain. Sab se khulay dil se milna, dil jo'i karna unka maslak o mashrub hai.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col items-center gap-4 md:flex-row-reverse md:items-start pb-1 border-b "
        id="ziyasb"
      >
        <div>
          <div
            data-aos="fade-up"
            className="photo flex flex-col gap-1 border rounded-md overflow-hidden text-center max-px-[300px] md:w-[600px]"
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
            <h3 className="text-2xl text-center p-2">Mohammad Anwar Ziya</h3>
          </div>
          <div className="details" dir="ltr">
            <div className="details leading-8 text-justify" dir="ltr">
              <p data-aos="fade-up" className="text-muted-foreground">
                Anwar Ziya - mashhoor alim din qari aur muballigh Rahmatullah sahab marhoom (Ismailpur Gorkhpur) ke laiq farzand aur Urdu se M-A hain. Urdu ke mo'tabar scholar, shaair aur adeeb hain, fan-e-arez par unhein dastaasr haasil hai. Islamia College ki managing committee ke rakan aur Anjuman Islamia Khooni Pur ke ek zimmedar ahdeedaar hain, khush mizaji aur sukun-shinasi unki sarasht mein dakhil hai. Adabi rasail mein unka kalam shaya hota rehta hai, All India Radio aur door darshan Gorkhpur se bhi unki nathri aur shaairi takhleeqat nathr hoti rehti hain. Urdu zaban ke farogh ke liye bhi unki koshish jari o sari.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
