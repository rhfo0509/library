# Book Buying Site
-----
## 사용방법
1. `npm i`
2. config/config.json 에서 development 부분 password 및 database 본인에 맞게 수정
3. `npx sequelize db:create`
4. `npm start`
-----
## 구현한 부분
1. 메인페이지 레이아웃
2. 회원가입 및 로그인
3. 검색 기능
4. 장바구니 기능
5. 구매하기 기능
6. 적립금 + 스탬프
7. 좋아요 기능
8. 관리자 페이지 기능 (유저, 쿠폰, 도서)
9. 쿠폰 기능
-----
## 수정해야 할 부분
1. 회원이 스스로 회원탈퇴할 수 있도록 한다.
2. 쿠폰 발급 조건을 수정한다. (매달마다 갱신)
3. 주문완료, 배송준비중, 배송중, 배송완료, 구매확정 state를 추가한다.
4. 회원가입 시 ID/PW 유효성 검사 : ID(영어/숫자만 가능) / PW(특문 포함, n글자 이상..)

```
insert into coupons (name, description, discountRate, discountPrice, minPrice) values ("신규가입 쿠폰", "3만원 이상 구매 시 만원 할인", 0, 10000, 30000);
insert into coupons (name, description, discountRate, discountPrice, minPrice) values ("BRONZE 등급 쿠폰", "구매 금액의 5% 할인", 5, 0, 0);
insert into coupons (name, description, discountRate, discountPrice, minPrice) values ("SILVER 등급 쿠폰", "구매 금액의 7% 할인", 7, 0, 0);
insert into coupons (name, description, discountRate, discountPrice, minPrice) values ("GOLD 등급 쿠폰", "구매 금액의 10% 할인", 10, 0, 0);
insert into coupons (name, description, discountRate, discountPrice, minPrice) values ("PLATINUM 등급 쿠폰", "구매 금액의 15% 할인", 15, 0, 0);
insert into coupons (name, description, discountRate, discountPrice, minPrice) values ("DIAMOND 등급 쿠폰", "구매 금액의 20% 할인", 20, 0, 0);

insert into books (title, authors, publisher, price, count, thumbnail, details) values ("원피스 102", "오다 에이 치로", "대원씨아이", 5700, 100, "https://image.aladin.co.kr/product/29679/85/cover200/k442838282_1.jpg", "https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=296798536");
insert into books (title, authors, publisher, price, count, thumbnail, details) values ("원피스 103", "오다 에이 치로", "대원씨아이", 4950, 50, "https://image.aladin.co.kr/product/30352/30/cover500/k592839643_1.jpg", "https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=303523008");
insert into books (title, authors, publisher, price, count, thumbnail, details) values ("원피스 101", "오다 에이 치로", "대원씨아이", 5200, 20, "https://image.aladin.co.kr/product/29146/39/cover500/k532837172_1.jpg", "https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=291463925");
insert into books (title, authors, publisher, price, count, thumbnail, details) values ("원피스 100", "오다 에이 치로", "대원씨아이", 4950, 10, "https://image.aladin.co.kr/product/28368/52/cover500/k972835400_1.jpg", "https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=283685224");
insert into books (title, authors, publisher, price, count, thumbnail, details) values ("원피스 1", "오다 에이 치로", "대원씨아이", 4950, 5, "https://image.aladin.co.kr/product/28135/84/cover500/k082734557_1.jpg", "https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=281358410");

update users set grade="ADMIN" where id="admin";
```
