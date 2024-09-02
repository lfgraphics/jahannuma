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
        سرپرست و بانی
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
              height={300}
              width={300}
              className="rounded-t-md object-cover transition-all ease-in-out hover:scale-110"
              src="/founders/jalib.jpg"
              alt="jalib sb"
            />
          </div>
          <h3 className="text-2xl text-center p-2">جالب نعمانی</h3>
        </div>
        <div className="details leading-8" dir="rtl">
          <p data-aos="fade-up">
            جالب نعمانی کا ذاتی نام ہدایت اللہ اور صفاتی نام جالب نعمانی۔ مولود
            و مسکن عسکر گنج گورکھپور ہے۔ انہیں ادبیات عربی فارسی اور اردو پر
            عبور حاصل ہے۔ شاعری انکی خانہ زاد ہے۔ ان کے لا تعداد شاگرد ہیں جو
            میدانِ شاعری میں اپنا کمال دکھا رہے ہیں انہیں استاد الشعراء کا درجہ
            حاصل ہے۔ جالب صاحب کی ادبی اور اردو خدمات کا تفصیلی جائزہ لیا جائے
            تو ایک مکمل کتاب وجود میں آ سکتی ہے۔ اردو کی خدمت میں انہوں نے اپنی
            زندگی کا بیشتر حصہ صرف کر دیا، بغیر منفیت اور سود و زیاں وہ اس میدان
            میں ہمیشہ سرگرم رہے ہیں اسکے لیے انہوں نے اپنے جسم کا ایک اک قطرہ
            لہو نچوڑ دیا ہے اسے انکا ایک مثالی کارنامہ کہا جا سکتا ہے۔
          </p>
          <p data-aos="fade-up">
            سبسے پہلے انہوں نے ایک ادبی ادارہ نگار ادب قائم کیا، اسکے علاوہ شہر
            کے دیگر ادبی اداروں اور انجمنوں مثلاً ارباب ذوق، ادبی سوسائٹی، بزمِ
            ادب، انجمنِ ترقی پسند مصنفین، انجمنِ ترقی اردو، نئے زاویے وغیرہ سے
            تعلق رکھا ااور عہدیدار رہے۔ عوامی لائبریری قائم کی، اردو شبینہ اسکول
            کھولا، اردو محافظِ دستہ کی تحریک میں شامل رہے اسکے لیے انہوں
            نےکلکٹریٹ میں جو بھوک ہڑتال ہوئی اسمیں بھی شریک رہے، کچھ ادبی اود
            دینی رسائل کی مجلس ادرت میں رہ کر اپنے قلم جوہر دکھتے رہے۔ جالب صاحب
            کی ان بے مثال خدمات کی ستائش اور اعتراف مختلف اداروں نے اعزازات سے
            نوازا، اوارڈز دیے، جیسے انجمن ترقی اردو اوارڈ، مولوی احسان اللہ
            عباسی اوارڈ، پروفیسر افغان اللہ خاں اوارڈ، ایم کوٹھیاویں راہی اوارڈ،
            مدھکر سمان، شمع ادب اوارڈ، فخرالدین علی احمد اوارڈ، ہندی گورکھپوری
            اوارڈ وغیرہ موجودہ وقت میں اربابِ سخن گورکھپور اور "جہاں نما "کے
            بانی و سرپرست ہیں۔
          </p>
          <div
            data-aos="fade-up"
            className="w-full flex items-center content-center justify-center"
          >
            <p className="text-center w-max">
              دیکھتے رہے جنوں کی حکایات خونچکاں
              <br />
              ہر چند اسمیں ہاتھ ہمارے قلم ہوئے
            </p>
          </div>
        </div>
      </div>
      <h3 data-aos="fade-up" className="text-xl text-center p-2 pb-4">
        سرپرست حضرات
      </h3>
      <div
        data-aos="fade-up"
        className="flex flex-col items-center gap-4 md:flex-row-reverse md:items-start pb-1 border-b "
        id="azizsb"
      >
        <div className="photo flex flex-col gap-1 border rounded-md overflow-hidden text-center mb-4 max-w-[300px] md:w-[600px]">
          <div className="photowrapper overflow-hidden">
            <img
              height={300}
              width={300}
              className="rounded-t-md object-cover transition-all ease-in-out hover:scale-110"
              src="/founders/aziz.png"
              alt="aziz sb"
            />
          </div>
          <h3 className="text-2xl text-center p-2">ڈاکٹر عزیز احمد</h3>
        </div>
        <div className="details" dir="rtl">
          <div className="details leading-8" dir="rtl">
            <p data-aos="fade-up">
              ڈاکٹر عزیز احمد ایم - ڈی مسلم یونیورسٹی کے فیض یافتہ ایک جامع اثر
              انگیز اور دلنواز شخصیت کے مالک ہیں انکی شخصیت کا ایک اہم جزئ صلہ
              کل ہے شاندار خاندانی پسِ منظر رکھتے ہیں شعر فہمی غضب کی، یاد داشت
              بے مثال، ذکاوت اور نبضِ شناسی لا جواب ہے، سیکڑوں اشرار اور نزمیں
              حفظ ہیں، جنکا استعمال دورانِ خطابت (تقریر) برجستہ اور برمحل کرتے
              رہتے ہیں۔
            </p>
            <p data-aos="fade-up">
              احمد ہاسپٹل ابو بازار انچوا کے بنیاد کار اور مالک ہیں۔ اسی ست متصل
              انکی شاندار رہائشگاہ ہے، انتہائی، شفیق، بردبار اور بزلہ سنج ہیں۔
              اردو زبان اور شعر و ادب کے لیے انکی خدمات ہمیشہ یاد رکھی جائیں گی۔
              انکی شخصیت کے ہمہ رنگ پہلوؤں کو اجاگر کرنے کے لیے درج ذیل شعر بہت
              موزوں اور حسبِ حال ہیں۔
            </p>
            <div
              data-aos="fade-up"
              className="w-full flex items-center content-center justify-center"
            >
              <p className="text-center w-max">
                جو دل پہ گزرتیہے رقم کرتے رہیں گے
                <br />
                ہم پرورشِ لوح و قلم کرتے رہیں گے
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
              height={300}
              width={300}
              className="rounded-t-md object-cover transition-all ease-in-out hover:scale-110"
              src="/founders/haris.png"
              alt="haris sb"
            />
          </div>
          <h3 className="text-2xl text-center p-2">محبوب سعید حارث</h3>
        </div>
        <div className="details" dir="rtl">
          <div className="details leading-8" dir="rtl">
            <p data-aos="fade-up">
              محبوب سعید حارث شہر گورکھپور کے مشہور ادیب و شاعر اور رئیس سید
              حامد علی گلفشاں قاضی پور خورد کے صاحبزادے ہیں، معززین میں انہیں
              ایک اہم مقام حاصل تھا، انہوں نے اپنی رہائش گاہ میں ایک لائبریری
              قائم کر رکھی تھی جسمیں بہت ہی نادر و نایاب کتابیں آج بھی موجود
              ہیں۔ حارث صاحب کے دادا سید ساجد علی ایڈووکیٹ ایک ماہر قانون داں
              اور کہنہ مشق شاعر تھے۔ انکی غزل کے ایک مصرعے (ہم اڑنا چاہتے تھے
              آشیاں سے) پر ساجد علی میموریل کمیٹی ک زیرِ اہتمام حامد علی ھال
              گھاسی کٹرہ میں ایک شعری انعامی نشست منعقد ہو چکی ہے۔ یہ شعری نشست
              محبوب سعید حارث کے زہنی تنوع کی زندہ مثال ہے۔
            </p>
            <p data-aos="fade-up">
              محبوب سعید حارث گورکھپور یونیورسٹی سے اردو میں پی ایچ ڈی ہیں، انکی
              شخصیت کی تعمیر میں والد اور دادا کے ذوقِ سخنوری اور جزبۂ خدمت نے
              بہت اہم رول ادا کیا ہے یہی وجو ہے کہ خدمت خلق انکی رگوں میں لہو بن
              کر دوڑ رہی ہے۔ انہوں نے ساجد علی میموریل کمیٹی قائم کر کے خدمات کا
              جو سلسلہ شروع کیا ہے وہ مثالی ہے اور قابل تحسین بھی۔ اردو زبان میں
              انکی مساعیی جمیلہ کے ساتھ ہی تعلیمی میدان بھی زیرِ قدم ہے، میاں
              صاحب انٹر میڈیٹ کالج کے ایک فعال مینیجر کے ساتھ گورکھپور کے مشہور
              دینی ادارے انجمن اسلامیہ کے ذمہ دار ااور عہدہ دار بھی ہیں۔ سب سے
              کھلے دل سے ملنا، دل جوئی کرنا انکا مثلک و مشرب ہے۔
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
              height={300}
              width={300}
              className="rounded-t-md object-cover transition-all ease-in-out hover:scale-110"
              src="/founders/ziya.png"
              alt="ziya sb"
            />
          </div>
          <h3 className="text-2xl text-center p-2">انور ضیا</h3>
        </div>
        <div className="details" dir="rtl">
          <div className="details leading-8" dir="rtl">
            <p data-aos="fade-up">
              انور ضیا - مشہور عالم دین قاری اور مبلغ رحمت اللہ صاحب مرہوم
              (اسماعیل پور گورکھپور) کے لائق فرزند اور اردو سے ایم-اےہیں اردو کے
              معتبر اسکالر، شاعر اور ادیب ہیں، فن عروض پر انہیں دسترس حاصل ہے۔
              اسلامیہ کالج کی مینیجنگ کمیٹی کے رکن اور انجمن اسلامیہ خونی پور کے
              ایک ذمے دار عہدیدار ہیں خوش مجازی اور سخن شناسی انکی سرشت میں داحل
              ہے۔ ادبی رسائل میں انکا کلام شائع ہوتا رہا ہے، آل انڈیا ریڈیو اور
              دور درشن گورکھپور سے بھی انکی نثری اور شعری تخلیقات نثر ہوتی رہتی
              ہیں۔ اردو زبان کے فروغ کے لیے بھی انکی کوشش جاری و ساری ہیں۔
              گورکھپور کے مشہور ادارے ارباب سخن کے جنرل سکریٹری ہیں اسکے علاوہ
              اردو اکیڈمی اتر پردیچ کے 2009 تا 2011 (3 سال) تک ممبر بھی رہے۔
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
