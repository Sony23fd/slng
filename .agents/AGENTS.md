# Төслийн хөгжүүлэлтийн болон тооцооллын хатуу дүрмүүд (AGENTS.md)

Энэхүү файл нь Selenge хэвлэлийн үйлдвэрийн захиалга болон үнийн тооцооллын системийн амин сүнс болсон архитектур, тооцооллын логик болон код бичих стандартуудыг тодорхойлно. Энэ төсөл дээр ажиллах аливаа AI агент болон хөгжүүлэгч эдгээр дүрмийг **ЯГ ТАГ** мөрдөх үүрэгтэй.

---

## 🔴 1. ХАТУУ ХОРИГЛОХ ДҮРЭМ (CRITICAL CALCULATION SAFEGUARDS)

1. **Тооцооллын логикт дураараа хүрэхийг ХАТУУ ХОРИГЛОНО**:
   - Захиалгын маягтын (`OrderForm.tsx`) цаас тооцох (`calculatePaperDivision`, `calculateSetups`), бүрэлт тооцох (`calculateCoatingOperation`), ажиллагааны томьёо бодох (`evaluateOperationFormula`) болон `useEffect` доторх тусгайлсан бодолтуудыг UI шинэчлэх, загвар (style) засах эсвэл код цэгцлэх (refactor) нэрийдлээр өөрчлөх, устгах, хөндөхийг эрс хориглоно.
2. **Тооцоололд өөрчлөлт оруулах журам**:
   - Хэрэв тооцооллын томьёо эсвэл логикт өөрчлөлт оруулах шаардлага гарвал **ЗААВАЛ** хэрэглэгчээс (USER) урьдчилан тодорхой зөвшөөрөл авч, хэвлэлийн үйлдвэрлэлийн физик бодолтоор (цаасны хуваалт, талбай гэх мэт) баталгаажуулсны дараа л хэрэгжүүлнэ.

---

## 💡 2. ТУСГАЙЛСАН БОДОЛТУУДЫН СТАНДАРТ (ESTABLISHED CALCULATIONS)

Аливаа тооцооллын алдааг засварлах эсвэл шалгахдаа дараах батлагдсан бизнесийн дүрмүүдийг үндэслэл болгоно:

### А. Брошур (Brochure)
- **[M4] Хэвлэлийн хуудас**: Үргэлж **`1`** гэж албадан тохируулагдана.
- **[M5] Үндсэн хэвлэх тоо**: Захиалгын нийт тоог цаасны хуваалтад хувааж гаргана. E.g., $\text{M5} = \lceil \text{Захиалгын нийт тоо} / \text{calculatePaperDivision(Хэв. хэмжээ, Бүтээгдэхүүний хэмжээ)} \rceil$.

### Б. Цаасан тор (Paper Bag)
- **Дэлгээс хэмжээ (Flat sheet size)**: Тор нь 3 хэмжээст биет тул хавтгай дэлгээсийг дараах томьёогоор бодно:
  - $\text{Дэлгээс Өргөн} = (\text{Өргөн} + \text{Хажуу}) \times 2$
  - $\text{Дэлгээс Өндөр} = \text{Өндөр} + \text{Амсар нугалаа} + \text{Ёроол нугалаа}$ *(Амсар болон Ёроол стандарт нь тус бүр 6см)*
- **Цаасны тооцоо**:
  - Дэлгээс хэмжээ нь B2 (720х520мм) эсвэл А2 материалд 1 ширхэг багтах тул **[M4] Хэвлэлийн хуудас = 1**, **[M5] Үндсэн тоо = Захиалгын нийт тоо** байна.
  - B1 том цааснаас B2 зүсэх тул **[M8] Хуваалт = 2**, том цаасны хэрэгцээт тоо **[M9] = (M5 + M6 Хадаас) / 2** байна.

### В. Бүрэлт (Coating)
- Хавтасны бүрэлтийн мөрөнд **"Хадаас"** (нэмэлт хуудас) оруулах тусгай input талбар байрлана.
- Томьёо: $(\text{M5 Үндсэн тоо} + \text{Хадаас}) \times \text{Коэффициент}$.
- Коэффициент нь хэвлэлийн хэмжээнээс хамаарна:
  - `B2` хэмжээтэй бол **54см** хуулга $\rightarrow$ Коэффициент: **`0.007`**
  - `A2` хэмжээтэй бол **44см** хуулга $\rightarrow$ Коэффициент: **`0.006`**
  - `A3` эсвэл `B3` хэмжээтэй бол **36см** хуулга $\rightarrow$ Коэффициент: **`0.004`**

### Г. Оосор (Bag Straps)
- 1 торонд 2 ш оосор орох тул Ажиллагааны томьёо нь үргэлж `total_qty * 2` байна.

### Д. Ажиллагааны хэмжигдэхүүн (Operations Formulas)
Дараах ажиллагаануудын тооцоолол нь захиалгын нийт тоогоор биш, хэвлэгдэх цаасны бодит тоогоор (Үндсэн хэвлэх тоо $\times$ Хэвлэлийн хуудас) буюу систем дэх `total_base_sheets` хувьсагчаар бодогдоно:
- **Нугалаа**, **Шалгах**, **Цуглуулга**
- **Хэвлэгч (1 өнгө, 2 өнгө, 4 өнгө, 5 өнгө)**
Эдгээр томьёог `seed-prices.ts` дотор `expr: 'total_base_sheets'` гэж хатуу тохируулж өгсөн бөгөөд дураараа `total_qty` руу буцаахыг хориглоно.

### Е. Хавтасны дүрмийн матриц (Cover Rules Standard Matrix)
Хавтасны хэвлэлийн хуудас (`press_sheet`), хуваалт (`divide_by`), болон хэвлэх хэмжээ (`print_size`) нь бүтээгдэхүүний хэмжээ болон үдэлтийн төрлөөс хамаарч дараах батлагдсан дүрмийг мөрдөнө:
- **A4 Наалттай**: `PressSheet = 1.0`, `DivideBy = 6`, `PrintSize = A3`
- **A4 Үдээстэй**: `PressSheet = 0.5`, `DivideBy = 4`, `PrintSize = A2`
- **A4 Хатуу хавтастай**: `PressSheet = 1.0`, `DivideBy = 5`, `PrintSize = B3`
- **A4 Хөөсөн хатуу хавтастай**: `PressSheet = 1.0`, `DivideBy = 3`, `PrintSize = B2`
- **A5 Наалттай**: `PressSheet = 0.5`, `DivideBy = 5`, `PrintSize = B3`
- **A5 Үдээстэй**: `PressSheet = 0.25`, `DivideBy = 4`, `PrintSize = A2`
- **A5 Хатуу хавтастай**: `PressSheet = 0.5`, `DivideBy = 4`, `PrintSize = A2`
- **A5 Хөөсөн хатуу хавтастай**: `PressSheet = 0.5`, `DivideBy = 4`, `PrintSize = A2`
- **A6 Наалттай**: `PressSheet = 0.25`, `DivideBy = 4`, `PrintSize = A2`
- **A6 Үдээстэй**: `PressSheet = 0.125`, `DivideBy = 4`, `PrintSize = A2`
- **B4 Наалттай**: `PressSheet = 1.0`, `DivideBy = 4`, `PrintSize = A2`
- **B4 Үдээстэй**: `PressSheet = 0.5`, `DivideBy = 2`, `PrintSize = B2`
- **B4 Хатуу хавтастай**: `PressSheet = 1.0`, `DivideBy = 4`, `PrintSize = A2`
- **B5 Наалттай**: `PressSheet = 0.5`, `DivideBy = 4`, `PrintSize = A2`
- **B5 Үдээстэй**: `PressSheet = 0.5`, `DivideBy = 5`, `PrintSize = B3`
- **B5 Хатуу хавтастай**: `PressSheet = 1.0`, `DivideBy = 5`, `PrintSize = B3`
- **B5 Хөөсөн хатуу хавтастай**: `PressSheet = 0.5`, `DivideBy = 4`, `PrintSize = A2`
- **B6 Наалттай**: `PressSheet = 0.25`, `DivideBy = 4`, `PrintSize = A2`
- **B6 Үдээстэй**: `PressSheet = 0.25`, `DivideBy = 5`, `PrintSize = B3`

### Ё. Машины хадаас ба Тохируулга (Makeready & Setups Standard)
- **Хадаасны шатлал (`calculateMakeready`)**:
  - $\text{Base} \le 1000 \rightarrow 100$ хуудас
  - $\text{Base} \le 2000 \rightarrow 150$ хуудас
  - $\text{Base} \le 4000 \rightarrow 200$ хуудас
  - $\text{Base} \le 5000 \rightarrow 300$ хуудас
  - $\text{Base} \le 10000 \rightarrow 400$ хуудас
  - $\text{Base} \le 15000 \rightarrow 500$ хуудас
  - $\text{Base} \le 20000 \rightarrow 600$ хуудас
  - $\text{Base} \le 25000 \rightarrow 800$ хуудас
  - $\text{Base} \le 30000 \rightarrow 900$ хуудас
  - $\text{Base} > 30000 \rightarrow 1000$ хуудас
- **Тохируулга тооцох (`calculateSetups`)**:
  - $\text{Бүхэл хуудас} = \lfloor \text{press\_sheet} \rfloor$
  - Бутархай хуудасны үед $\text{popcount}(\text{round}(\text{fraction} \times \text{divisions}))$ ашиглан нэмэлт тохируулгын тоог гаргана.
- **Нийт цаасны тооцоо**:
  - $\text{Total Qty} = (\text{Base} \times \text{PressSheet}) + (\text{Extra} \times \text{Setups})$
  - $\text{Sheet Qty (Том цаасны тоо)} = \lceil \text{Total Qty} / \text{DivideBy} \rceil$

### Ж. CTP Хавтан тооцох физик стандарт (CTP Plates Calculation)
- **Тогтмол үнэ**: `CTP_PLATE_PRICE = 8,800₮`
- **Хавтангийн тоо**:
  - Бүрэн хуудас: $\text{FullSheets} \times (\text{FrontColors} + \text{BackColors})$
  - Бутархай хуудас: Татаж хөмрөх (Work-and-turn) зарчмаар 1 хэвэнд хоёр тал багтдаг тул $\text{FractionalSetups} \times \max(\text{FrontColors}, \text{BackColors})$

### З. Календарийн спираль үдээсний стандарт (Calendar Spiral Binding)
- **Ширээний А5 (26 нүүр / 13 хуудас)**: 1 ширхэгт 24 ш спираль $\rightarrow \text{Qty} = \text{total\_qty} \times 24$
- **Ширээний B5 (26 нүүр / 13 хуудас)**: 1 ширхэгт 28 ш спираль $\rightarrow \text{Qty} = \text{total\_qty} \times 28$
- **Ханын А2 (14 нүүр / 7 хуудас)**: 1 ширхэгт 56 ш спираль $\rightarrow \text{Qty} = \text{total\_qty} \times 56$

### И. Санхүүгийн үнийн бодолтын дэс дараалал (Pricing Waterfall)
1. $\text{Үйлдвэрийн өртөг} = \sum \text{Материал} + \sum \text{Ажиллагаа} + \sum \text{Гадуур ажил} + \text{Хэвлэлт} + \text{Эх бэлтгэл}$
2. $\text{Нэгжийн өртөг} = \text{Үйлдвэрийн өртөг} / \text{Нийт бүтээгдэхүүний тоо}$
3. $\text{Цэвэр үнэ (Ашигтай)} = \text{Үйлдвэрийн өртөг} \times \text{Ашиг}$ *(Үндсэн тохиргоо 2.3 коэф, хямдруулахад 1.8 гэх мэт)*
4. $\text{Эцсийн үнэ (НӨАТ-тай)} = \text{Цэвэр үнэ} \times 1.10$ *(Хэрэв has_vat сонгосон бол)*
5. $\text{Нэгжийн үнэ} = \text{Эцсийн үнэ} / \text{Нийт тоо}$

### К. Хатуу хавтасны туслах материалын стандарт (Hardcover Auxiliary Materials Matrix)
Хатуу хавтастай болон Хөөсөн хатуу хавтастай номд дараах технологийн нормоор картон, форзац, капитал, хавчуурга тооцогдоно:
- **А5**:
  - Картон (Суурь 2мм): $\text{DivideBy} = 14 \rightarrow \text{SheetQty} = \lceil \text{TotalQty} / 14 \rceil$
  - Форзац (200гр матт):
    - Хэвлэлгүй: $\text{DivideBy} = 8 \rightarrow \text{SheetQty} = \lceil \text{TotalQty} / 8 \rceil$
    - Хэвлэлтэй: $\text{PrintSize} = \text{A2}, \text{DivideBy} = 4, \text{Extra} = 100 \rightarrow \lceil (\text{TotalQty} \times 0.5 + 100) / 4 \rceil$
  - Номын капитал: $\lceil \text{TotalQty} / 25 \rceil$ метр
  - Хавчуурга утас (хэрэв хавчуургатай бол): $\lceil \text{TotalQty} \times 0.30 \rceil$ метр
- **В5**:
  - Картон: $\text{DivideBy} = 9 \rightarrow \text{SheetQty} = \lceil \text{TotalQty} / 9 \rceil$
  - Форзац:
    - Хэвлэлгүй: $\text{DivideBy} = 5 \rightarrow \text{SheetQty} = \lceil \text{TotalQty} / 5 \rceil$
    - Хэвлэлтэй: $\text{DivideBy} = 5, \text{Extra} = 100 \rightarrow \lceil (\text{TotalQty} + 100) / 5 \rceil$
  - Номын капитал: $\lceil \text{TotalQty} / 16 \rceil$ метр
  - Хавчуурга утас: $\lceil \text{TotalQty} \times 0.33 \rceil$ метр
- **А4**:
  - Картон: $\text{DivideBy} = 7 \rightarrow \text{SheetQty} = \lceil \text{TotalQty} / 7 \rceil$
  - Форзац:
    - Хэвлэлгүй: $\text{DivideBy} = 4 \rightarrow \text{SheetQty} = \lceil \text{TotalQty} / 4 \rceil$
    - Хэвлэлтэй: $\text{DivideBy} = 4, \text{Extra} = 100 \rightarrow \lceil (\text{TotalQty} + 100) / 4 \rceil$
  - Номын капитал: $\lceil \text{TotalQty} / 14 \rceil$ метр
  - Хавчуурга утас: $\lceil \text{TotalQty} \times 0.38 \rceil$ метр
- **В4**:
  - Картон: $\text{DivideBy} = 4.5 \rightarrow \text{SheetQty} = \lceil \text{TotalQty} / 4.5 \rceil$
  - Форзац:
    - Хэвлэлгүй: $\text{DivideBy} = 2.5 \rightarrow \text{SheetQty} = \lceil \text{TotalQty} / 2.5 \rceil$
    - Хэвлэлтэй: $\text{DivideBy} = 5, \text{Base} = \text{TotalQty} \times 2, \text{Extra} = 100 \rightarrow \lceil (\text{TotalQty} \times 2 + 100) / 5 \rceil$
  - Номын капитал: $\lceil \text{TotalQty} / 12 \rceil$ метр
  - Хавчуурга утас: $\lceil \text{TotalQty} \times 0.44 \rceil$ метр

### Л. Супер хавтасны физик стандарт (Dust Jacket / Super Cover Matrix - sx.jpg)
Супер хавтас нь номын үндсэн хавтасны гадуур нэмэлт материал болж өмсгөгдөх ба дараах дэлгээс, хуваалтын стандартыг мөрдөнө:
- **А5**:
  - Үндсэн хавтасны цаас (250гр): $\text{PrintSize} = \text{B3}, \text{PressSheet} = 1.0, \text{DivideBy} = 6, \text{Extra} = 100 \rightarrow \lceil (\text{Base} + 100) / 6 \rceil$
  - Форзац (157гр матт): $\text{DivideBy} = 16 \rightarrow \lceil \text{TotalQty} / 16 \rceil$
- **В5**:
  - Үндсэн хавтасны цаас (250гр): $\text{PrintSize} = 594\times 280\text{мм}, \text{PressSheet} = 1.0, \text{DivideBy} = 6, \text{Extra} = 100 \rightarrow \lceil (\text{Base} + 100) / 6 \rceil$
  - Форзац (157гр матт): $\text{DivideBy} = 10 \rightarrow \lceil \text{TotalQty} / 10 \rceil$
- **А4**:
  - Үндсэн хавтасны цаас (250гр): $\text{PrintSize} = 720\times 380\text{мм}, \text{PressSheet} = 1.0, \text{DivideBy} = 3, \text{Extra} = 100 \rightarrow \lceil (\text{Base} + 100) / 3 \rceil$
  - Форзац (157гр матт): $\text{DivideBy} = 8 \rightarrow \lceil \text{TotalQty} / 8 \rceil$
- **В4**:
  - Үндсэн хавтасны цаас (250гр): $\text{PrintSize} = \text{B2} (720\times 520\text{мм}), \text{PressSheet} = 1.0, \text{DivideBy} = 2, \text{Extra} = 100 \rightarrow \lceil (\text{Base} + 100) / 2 \rceil$
  - Форзац (157гр матт): $\text{DivideBy} = 5 \rightarrow \lceil \text{TotalQty} / 5 \rceil$
- **Ажиллагаа**: `Супер хавтас хийх` (1000₮ / ширхэг).

---

## 🎨 3. UI БОЛОН ДИЗАЙНЫ СТАНДАРТ (UI & STYLING GUIDELINES)

1. **Эрээн цоохор инлайн стиль хориглоно**: Шинээр input, select эсвэл товчлуур нэмэхдээ хатуу хаягласан өнгө (napalm orange, bright red гэх мэт), хүрээ (border) болон дотоод зай (padding) инлайн байдлаар бичихийг хориглоно.
2. **Системийн стандарт стиль**: Системд аль хэдийн тодорхойлогдсон `form-group`, `form-grid`, `section-title` зэрэг стандарт CSS классуудыг ашиглан бусад стандарт нүднүүдтэй (Тоо, Нэгж өртөг гэх мэт) 100% яг ижилхэн өндөр, жигд цэмбэгэр дизайнтай болгоно.

---

## 🛠️ 4. ХӨГЖҮҮЛЭЛТ БОЛОН GIT СТАНДАРТ (DEVELOPMENT & GIT RULES)

1. **Git Commit салгаж хийх (CRITICAL)**:
   - Хэрэглэгчийн Git түүхийг цэвэр байлгах үүднээс **Backend** болон **Frontend** хавтаст хийгдсэн өөрчлөлтүүдийг **ҮРГЭЛЖ ТУС ТУСАД НЬ САЛГАЖ COMMIT ХИЙНЭ**.
   - Жишээ нь:
     ```bash
     git add backend/...
     git commit -m "feat(backend): ..."
     git add frontend/...
     git commit -m "feat(frontend): ..."
     ```
2. **TypeScript алдаа шалгах**:
   - Frontend дээр кодын өөрчлөлт хийсний дараа заавал `cd frontend && npx tsc --noEmit` командыг ажиллуулж шинээр алдаа үүсээгүйг шалгаж баталгаажуулна.
3. **Үнийн сан болон Сийд (Seeding)**:
   - Шинэ ажиллагаа, томьёо эсвэл үнийн тогтмол нэмэх бол зөвхөн код дээр бичээд орхихгүй, `backend/seed-prices.ts` файлд бүртгэж, `cd backend && npx ts-node seed-prices.ts` командаар баазад шинэчилж баталгаажуулна.
