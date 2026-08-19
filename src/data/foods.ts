import type { Food } from '../types'

// 내장 기본 음식 데이터셋 (공통 한식 위주, 오프라인 동작용)
// 영양값은 1회 제공량(servingSize, g) 기준의 대략적 표준값입니다.
// seedKey는 재삽입 방지를 위한 고유 키입니다.
type SeedFood = Omit<Food, 'id' | 'isCustom' | 'seedKey'> & { seedKey: string }

export const SEED_FOODS: SeedFood[] = [
  // 밥·죽
  { seedKey: 'bap-white', name: '흰쌀밥', category: '밥·죽', unit: '1공기', servingSize: 210, kcal: 310, carbs: 68, protein: 6, fat: 1, sodium: 3 },
  { seedKey: 'bap-brown', name: '현미밥', category: '밥·죽', unit: '1공기', servingSize: 210, kcal: 300, carbs: 64, protein: 7, fat: 2, sodium: 4 },
  { seedKey: 'bap-multigrain', name: '잡곡밥', category: '밥·죽', unit: '1공기', servingSize: 210, kcal: 305, carbs: 65, protein: 8, fat: 2, sodium: 4 },
  { seedKey: 'bibimbap', name: '비빔밥', category: '밥·죽', unit: '1그릇', servingSize: 500, kcal: 560, carbs: 85, protein: 18, fat: 15, sodium: 900 },
  { seedKey: 'kimchi-fried-rice', name: '김치볶음밥', category: '밥·죽', unit: '1접시', servingSize: 400, kcal: 590, carbs: 80, protein: 14, fat: 22, sodium: 1200 },
  { seedKey: 'gimbap', name: '김밥', category: '밥·죽', unit: '1줄', servingSize: 230, kcal: 480, carbs: 78, protein: 12, fat: 12, sodium: 780 },
  { seedKey: 'juk-abalone', name: '전복죽', category: '밥·죽', unit: '1그릇', servingSize: 400, kcal: 330, carbs: 55, protein: 12, fat: 6, sodium: 800 },
  { seedKey: 'juk-pumpkin', name: '호박죽', category: '밥·죽', unit: '1그릇', servingSize: 350, kcal: 260, carbs: 52, protein: 4, fat: 4, sodium: 300 },
  { seedKey: 'omurice', name: '오므라이스', category: '밥·죽', unit: '1접시', servingSize: 400, kcal: 620, carbs: 82, protein: 18, fat: 22, sodium: 1100 },

  // 면·만두
  { seedKey: 'ramen', name: '라면', category: '면·만두', unit: '1개', servingSize: 550, kcal: 500, carbs: 79, protein: 11, fat: 16, sodium: 1790 },
  { seedKey: 'jjajangmyeon', name: '짜장면', category: '면·만두', unit: '1그릇', servingSize: 650, kcal: 700, carbs: 110, protein: 16, fat: 20, sodium: 1500 },
  { seedKey: 'jjamppong', name: '짬뽕', category: '면·만두', unit: '1그릇', servingSize: 700, kcal: 680, carbs: 95, protein: 25, fat: 20, sodium: 2000 },
  { seedKey: 'kalguksu', name: '칼국수', category: '면·만두', unit: '1그릇', servingSize: 700, kcal: 520, carbs: 88, protein: 18, fat: 10, sodium: 1600 },
  { seedKey: 'naengmyeon', name: '물냉면', category: '면·만두', unit: '1그릇', servingSize: 650, kcal: 460, carbs: 90, protein: 14, fat: 5, sodium: 1400 },
  { seedKey: 'bibim-naengmyeon', name: '비빔냉면', category: '면·만두', unit: '1그릇', servingSize: 550, kcal: 500, carbs: 95, protein: 14, fat: 6, sodium: 1300 },
  { seedKey: 'udon', name: '우동', category: '면·만두', unit: '1그릇', servingSize: 600, kcal: 420, carbs: 78, protein: 12, fat: 6, sodium: 1500 },
  { seedKey: 'spaghetti', name: '스파게티', category: '면·만두', unit: '1접시', servingSize: 400, kcal: 600, carbs: 80, protein: 18, fat: 22, sodium: 900 },
  { seedKey: 'mandu', name: '만두(찐)', category: '면·만두', unit: '5개', servingSize: 200, kcal: 350, carbs: 42, protein: 12, fat: 14, sodium: 600 },
  { seedKey: 'tteokguk', name: '떡국', category: '면·만두', unit: '1그릇', servingSize: 600, kcal: 480, carbs: 88, protein: 14, fat: 8, sodium: 1400 },
  { seedKey: 'pho-beef', name: '쌀국수(베트남)', category: '면·만두', unit: '1그릇', servingSize: 600, kcal: 520, carbs: 82, protein: 24, fat: 9, sodium: 1700 },

  // 국·찌개
  { seedKey: 'doenjang-jjigae', name: '된장찌개', category: '국·찌개', unit: '1그릇', servingSize: 350, kcal: 180, carbs: 14, protein: 12, fat: 8, sodium: 1300 },
  { seedKey: 'kimchi-jjigae', name: '김치찌개', category: '국·찌개', unit: '1그릇', servingSize: 400, kcal: 250, carbs: 12, protein: 16, fat: 14, sodium: 1500 },
  { seedKey: 'sundubu', name: '순두부찌개', category: '국·찌개', unit: '1그릇', servingSize: 400, kcal: 230, carbs: 12, protein: 15, fat: 13, sodium: 1300 },
  { seedKey: 'miyeokguk', name: '미역국', category: '국·찌개', unit: '1그릇', servingSize: 350, kcal: 110, carbs: 6, protein: 8, fat: 5, sodium: 900 },
  { seedKey: 'kongnamul-guk', name: '콩나물국', category: '국·찌개', unit: '1그릇', servingSize: 350, kcal: 60, carbs: 6, protein: 5, fat: 2, sodium: 800 },
  { seedKey: 'seolleongtang', name: '설렁탕', category: '국·찌개', unit: '1그릇', servingSize: 600, kcal: 400, carbs: 20, protein: 32, fat: 20, sodium: 1300 },
  { seedKey: 'galbitang', name: '갈비탕', category: '국·찌개', unit: '1그릇', servingSize: 600, kcal: 420, carbs: 18, protein: 34, fat: 22, sodium: 1400 },
  { seedKey: 'samgyetang', name: '삼계탕', category: '국·찌개', unit: '1그릇', servingSize: 700, kcal: 620, carbs: 30, protein: 50, fat: 30, sodium: 900 },
  { seedKey: 'yukgaejang', name: '육개장', category: '국·찌개', unit: '1그릇', servingSize: 500, kcal: 320, carbs: 16, protein: 26, fat: 16, sodium: 1600 },
  { seedKey: 'budae-jjigae', name: '부대찌개', category: '국·찌개', unit: '1인분', servingSize: 500, kcal: 480, carbs: 30, protein: 24, fat: 28, sodium: 1900 },

  // 고기·계란
  { seedKey: 'samgyeopsal', name: '삼겹살(구이)', category: '고기·계란', unit: '1인분', servingSize: 150, kcal: 500, carbs: 0, protein: 27, fat: 43, sodium: 120 },
  { seedKey: 'dwaeji-bulgogi', name: '제육볶음', category: '고기·계란', unit: '1인분', servingSize: 200, kcal: 420, carbs: 18, protein: 26, fat: 26, sodium: 1100 },
  { seedKey: 'bulgogi', name: '소불고기', category: '고기·계란', unit: '1인분', servingSize: 200, kcal: 350, carbs: 16, protein: 28, fat: 18, sodium: 900 },
  { seedKey: 'galbi', name: '돼지갈비(양념)', category: '고기·계란', unit: '1인분', servingSize: 250, kcal: 550, carbs: 20, protein: 32, fat: 36, sodium: 1000 },
  { seedKey: 'chicken-breast', name: '닭가슴살(삶은)', category: '고기·계란', unit: '100g', servingSize: 100, kcal: 165, carbs: 0, protein: 31, fat: 3.6, sodium: 60 },
  { seedKey: 'fried-chicken', name: '후라이드치킨', category: '고기·계란', unit: '3조각', servingSize: 180, kcal: 500, carbs: 24, protein: 30, fat: 30, sodium: 800 },
  { seedKey: 'yangnyeom-chicken', name: '양념치킨', category: '고기·계란', unit: '3조각', servingSize: 200, kcal: 560, carbs: 40, protein: 28, fat: 30, sodium: 950 },
  { seedKey: 'dakgalbi', name: '닭갈비', category: '고기·계란', unit: '1인분', servingSize: 300, kcal: 480, carbs: 30, protein: 32, fat: 24, sodium: 1300 },
  { seedKey: 'tangsuyuk', name: '탕수육', category: '고기·계란', unit: '1인분', servingSize: 250, kcal: 620, carbs: 55, protein: 22, fat: 34, sodium: 700 },
  { seedKey: 'gyeranmari', name: '계란말이', category: '고기·계란', unit: '1접시', servingSize: 150, kcal: 220, carbs: 4, protein: 15, fat: 16, sodium: 400 },
  { seedKey: 'boiled-egg', name: '삶은 계란', category: '고기·계란', unit: '1개', servingSize: 50, kcal: 78, carbs: 0.6, protein: 6.3, fat: 5.3, sodium: 62 },
  { seedKey: 'fried-egg', name: '계란후라이', category: '고기·계란', unit: '1개', servingSize: 55, kcal: 110, carbs: 0.6, protein: 7, fat: 9, sodium: 90 },
  { seedKey: 'tofu', name: '두부', category: '고기·계란', unit: '1/2모', servingSize: 150, kcal: 120, carbs: 3, protein: 12, fat: 7, sodium: 10 },

  // 생선·해산물
  { seedKey: 'grilled-mackerel', name: '고등어구이', category: '생선·해산물', unit: '1토막', servingSize: 120, kcal: 260, carbs: 0, protein: 24, fat: 18, sodium: 400 },
  { seedKey: 'grilled-saury', name: '삼치구이', category: '생선·해산물', unit: '1토막', servingSize: 120, kcal: 220, carbs: 0, protein: 23, fat: 14, sodium: 300 },
  { seedKey: 'grilled-eel', name: '장어구이', category: '생선·해산물', unit: '1인분', servingSize: 150, kcal: 350, carbs: 4, protein: 27, fat: 25, sodium: 500 },
  { seedKey: 'sashimi', name: '생선회(모듬)', category: '생선·해산물', unit: '1인분', servingSize: 150, kcal: 180, carbs: 0, protein: 32, fat: 5, sodium: 120 },
  { seedKey: 'grilled-shrimp', name: '새우구이', category: '생선·해산물', unit: '5마리', servingSize: 100, kcal: 100, carbs: 0, protein: 20, fat: 1.5, sodium: 200 },
  { seedKey: 'ojingeo-bokkeum', name: '오징어볶음', category: '생선·해산물', unit: '1인분', servingSize: 250, kcal: 320, carbs: 22, protein: 24, fat: 14, sodium: 1200 },
  { seedKey: 'godeungeo-jorim', name: '고등어조림', category: '생선·해산물', unit: '1토막', servingSize: 150, kcal: 240, carbs: 8, protein: 22, fat: 14, sodium: 900 },
  { seedKey: 'canned-tuna', name: '참치캔(기름)', category: '생선·해산물', unit: '1캔(100g)', servingSize: 100, kcal: 200, carbs: 0, protein: 26, fat: 11, sodium: 350 },

  // 반찬·나물
  { seedKey: 'sigeumchi', name: '시금치나물', category: '반찬·나물', unit: '1접시', servingSize: 80, kcal: 45, carbs: 3, protein: 3, fat: 2.5, sodium: 250 },
  { seedKey: 'kongnamul-muchim', name: '콩나물무침', category: '반찬·나물', unit: '1접시', servingSize: 80, kcal: 50, carbs: 4, protein: 4, fat: 2.5, sodium: 300 },
  { seedKey: 'gosari', name: '고사리나물', category: '반찬·나물', unit: '1접시', servingSize: 80, kcal: 70, carbs: 6, protein: 3, fat: 4, sodium: 300 },
  { seedKey: 'japchae', name: '잡채', category: '반찬·나물', unit: '1접시', servingSize: 200, kcal: 320, carbs: 48, protein: 8, fat: 10, sodium: 700 },
  { seedKey: 'gamja-jorim', name: '감자조림', category: '반찬·나물', unit: '1접시', servingSize: 120, kcal: 150, carbs: 26, protein: 3, fat: 4, sodium: 500 },
  { seedKey: 'myeolchi-bokkeum', name: '멸치볶음', category: '반찬·나물', unit: '1접시', servingSize: 40, kcal: 120, carbs: 8, protein: 10, fat: 5, sodium: 500 },
  { seedKey: 'dubu-jorim', name: '두부조림', category: '반찬·나물', unit: '1접시', servingSize: 150, kcal: 180, carbs: 8, protein: 13, fat: 11, sodium: 600 },
  { seedKey: 'gyeran-jjim', name: '계란찜', category: '반찬·나물', unit: '1그릇', servingSize: 200, kcal: 150, carbs: 4, protein: 13, fat: 9, sodium: 500 },
  { seedKey: 'gim', name: '구운 김', category: '반찬·나물', unit: '1봉(5g)', servingSize: 5, kcal: 25, carbs: 1, protein: 2, fat: 1.5, sodium: 80 },

  // 김치·장
  { seedKey: 'baechu-kimchi', name: '배추김치', category: '김치·장', unit: '1접시', servingSize: 60, kcal: 20, carbs: 4, protein: 1, fat: 0.3, sodium: 500 },
  { seedKey: 'kkakdugi', name: '깍두기', category: '김치·장', unit: '1접시', servingSize: 60, kcal: 25, carbs: 5, protein: 1, fat: 0.2, sodium: 450 },
  { seedKey: 'chonggak', name: '총각김치', category: '김치·장', unit: '1접시', servingSize: 60, kcal: 25, carbs: 5, protein: 1, fat: 0.3, sodium: 480 },
  { seedKey: 'ssamjang', name: '쌈장', category: '김치·장', unit: '1큰술', servingSize: 15, kcal: 30, carbs: 4, protein: 1.5, fat: 1, sodium: 400 },

  // 빵·간식
  { seedKey: 'toast-butter', name: '식빵(버터)', category: '빵·간식', unit: '1장', servingSize: 40, kcal: 150, carbs: 20, protein: 4, fat: 6, sodium: 200 },
  { seedKey: 'croissant', name: '크루아상', category: '빵·간식', unit: '1개', servingSize: 60, kcal: 250, carbs: 26, protein: 5, fat: 14, sodium: 300 },
  { seedKey: 'tteokbokki', name: '떡볶이', category: '빵·간식', unit: '1인분', servingSize: 300, kcal: 480, carbs: 92, protein: 10, fat: 8, sodium: 1400 },
  { seedKey: 'sundae', name: '순대', category: '빵·간식', unit: '1인분', servingSize: 200, kcal: 360, carbs: 40, protein: 12, fat: 16, sodium: 700 },
  { seedKey: 'hotteok', name: '호떡', category: '빵·간식', unit: '1개', servingSize: 100, kcal: 250, carbs: 42, protein: 4, fat: 8, sodium: 200 },
  { seedKey: 'gimbap-tuna', name: '참치김밥', category: '빵·간식', unit: '1줄', servingSize: 250, kcal: 540, carbs: 76, protein: 16, fat: 18, sodium: 900 },
  { seedKey: 'sandwich-ham', name: '햄샌드위치', category: '빵·간식', unit: '1개', servingSize: 200, kcal: 380, carbs: 42, protein: 16, fat: 16, sodium: 800 },
  { seedKey: 'hamburger', name: '햄버거', category: '빵·간식', unit: '1개', servingSize: 220, kcal: 520, carbs: 42, protein: 25, fat: 28, sodium: 900 },
  { seedKey: 'pizza-slice', name: '피자', category: '빵·간식', unit: '1조각', servingSize: 130, kcal: 300, carbs: 34, protein: 13, fat: 12, sodium: 640 },
  { seedKey: 'cookie', name: '초코칩쿠키', category: '빵·간식', unit: '1개', servingSize: 30, kcal: 140, carbs: 20, protein: 2, fat: 6, sodium: 90 },
  { seedKey: 'rice-cake', name: '가래떡', category: '빵·간식', unit: '1개', servingSize: 100, kcal: 210, carbs: 48, protein: 4, fat: 0.5, sodium: 100 },
  { seedKey: 'potato-chips', name: '감자칩', category: '빵·간식', unit: '1봉(60g)', servingSize: 60, kcal: 330, carbs: 33, protein: 4, fat: 21, sodium: 300 },

  // 과일
  { seedKey: 'apple', name: '사과', category: '과일', unit: '1개', servingSize: 200, kcal: 100, carbs: 27, protein: 0.5, fat: 0.3, sodium: 2 },
  { seedKey: 'banana', name: '바나나', category: '과일', unit: '1개', servingSize: 120, kcal: 105, carbs: 27, protein: 1.3, fat: 0.4, sodium: 1 },
  { seedKey: 'orange', name: '오렌지', category: '과일', unit: '1개', servingSize: 150, kcal: 70, carbs: 18, protein: 1.3, fat: 0.2, sodium: 0 },
  { seedKey: 'grape', name: '포도', category: '과일', unit: '1송이(100g)', servingSize: 100, kcal: 69, carbs: 18, protein: 0.7, fat: 0.2, sodium: 2 },
  { seedKey: 'strawberry', name: '딸기', category: '과일', unit: '10알(150g)', servingSize: 150, kcal: 48, carbs: 12, protein: 1, fat: 0.5, sodium: 1 },
  { seedKey: 'watermelon', name: '수박', category: '과일', unit: '1쪽(200g)', servingSize: 200, kcal: 60, carbs: 15, protein: 1.2, fat: 0.3, sodium: 2 },
  { seedKey: 'tangerine', name: '귤', category: '과일', unit: '1개', servingSize: 80, kcal: 40, carbs: 10, protein: 0.6, fat: 0.2, sodium: 1 },
  { seedKey: 'blueberry', name: '블루베리', category: '과일', unit: '1컵(100g)', servingSize: 100, kcal: 57, carbs: 14, protein: 0.7, fat: 0.3, sodium: 1 },
  { seedKey: 'kiwi', name: '키위', category: '과일', unit: '1개', servingSize: 80, kcal: 50, carbs: 12, protein: 0.9, fat: 0.4, sodium: 2 },
  { seedKey: 'tomato', name: '토마토', category: '과일', unit: '1개', servingSize: 150, kcal: 27, carbs: 6, protein: 1.3, fat: 0.3, sodium: 7 },

  // 유제품
  { seedKey: 'milk', name: '우유', category: '유제품', unit: '1컵(200ml)', servingSize: 200, kcal: 130, carbs: 10, protein: 6.6, fat: 7, sodium: 100 },
  { seedKey: 'low-fat-milk', name: '저지방우유', category: '유제품', unit: '1컵(200ml)', servingSize: 200, kcal: 90, carbs: 10, protein: 7, fat: 2, sodium: 110 },
  { seedKey: 'plain-yogurt', name: '플레인요거트', category: '유제품', unit: '1개(100g)', servingSize: 100, kcal: 60, carbs: 8, protein: 4, fat: 1.5, sodium: 50 },
  { seedKey: 'greek-yogurt', name: '그릭요거트', category: '유제품', unit: '1개(100g)', servingSize: 100, kcal: 97, carbs: 4, protein: 9, fat: 5, sodium: 35 },
  { seedKey: 'cheese-slice', name: '슬라이스치즈', category: '유제품', unit: '1장', servingSize: 20, kcal: 60, carbs: 1, protein: 4, fat: 4.5, sodium: 220 },
  { seedKey: 'string-cheese', name: '스트링치즈', category: '유제품', unit: '1개', servingSize: 20, kcal: 70, carbs: 0.5, protein: 6, fat: 5, sodium: 180 },

  // 음료
  { seedKey: 'americano', name: '아메리카노', category: '음료', unit: '1잔', servingSize: 300, kcal: 10, carbs: 2, protein: 0.5, fat: 0, sodium: 5 },
  { seedKey: 'latte', name: '카페라떼', category: '음료', unit: '1잔', servingSize: 300, kcal: 180, carbs: 16, protein: 9, fat: 9, sodium: 120 },
  { seedKey: 'orange-juice', name: '오렌지주스', category: '음료', unit: '1잔(200ml)', servingSize: 200, kcal: 90, carbs: 21, protein: 1.5, fat: 0.3, sodium: 4 },
  { seedKey: 'cola', name: '콜라', category: '음료', unit: '1캔(250ml)', servingSize: 250, kcal: 105, carbs: 27, protein: 0, fat: 0, sodium: 15 },
  { seedKey: 'beer', name: '맥주', category: '음료', unit: '1캔(355ml)', servingSize: 355, kcal: 150, carbs: 13, protein: 1.6, fat: 0, sodium: 14 },
  { seedKey: 'soju', name: '소주', category: '음료', unit: '1병(360ml)', servingSize: 360, kcal: 400, carbs: 0, protein: 0, fat: 0, sodium: 0 },
  { seedKey: 'protein-shake', name: '단백질쉐이크', category: '음료', unit: '1잔', servingSize: 300, kcal: 160, carbs: 8, protein: 25, fat: 3, sodium: 150 },
  { seedKey: 'soy-milk', name: '두유', category: '음료', unit: '1팩(190ml)', servingSize: 190, kcal: 120, carbs: 14, protein: 6, fat: 4, sodium: 90 },

  // 기타
  { seedKey: 'salad-chicken', name: '닭가슴살샐러드', category: '기타', unit: '1접시', servingSize: 300, kcal: 280, carbs: 18, protein: 30, fat: 10, sodium: 500 },
  { seedKey: 'salad-green', name: '그린샐러드(드레싱)', category: '기타', unit: '1접시', servingSize: 200, kcal: 150, carbs: 12, protein: 3, fat: 10, sodium: 400 },
  { seedKey: 'sweet-potato', name: '군고구마', category: '기타', unit: '1개', servingSize: 150, kcal: 190, carbs: 44, protein: 2.5, fat: 0.3, sodium: 20 },
  { seedKey: 'potato-boiled', name: '삶은 감자', category: '기타', unit: '1개', servingSize: 150, kcal: 130, carbs: 30, protein: 3, fat: 0.2, sodium: 10 },
  { seedKey: 'corn', name: '찐 옥수수', category: '기타', unit: '1개', servingSize: 150, kcal: 150, carbs: 33, protein: 5, fat: 2, sodium: 15 },
  { seedKey: 'nuts-mixed', name: '견과류믹스', category: '기타', unit: '1줌(30g)', servingSize: 30, kcal: 180, carbs: 6, protein: 5, fat: 16, sodium: 3 },
  { seedKey: 'oatmeal', name: '오트밀(우유)', category: '기타', unit: '1그릇', servingSize: 300, kcal: 250, carbs: 40, protein: 10, fat: 6, sodium: 120 },
  { seedKey: 'cereal-milk', name: '시리얼(우유)', category: '기타', unit: '1그릇', servingSize: 250, kcal: 280, carbs: 48, protein: 9, fat: 6, sodium: 250 },
  { seedKey: 'edamame', name: '풋콩(에다마메)', category: '기타', unit: '1접시(100g)', servingSize: 100, kcal: 120, carbs: 10, protein: 11, fat: 5, sodium: 6 },
]
