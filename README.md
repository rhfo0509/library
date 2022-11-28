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
-----
## 수정해야 할 부분
1. 리액트로 하기엔 지식의 한계가 있다... 대신 템플릿 엔진(nunjucks)를 사용해서 html 파일을 렌더링해주도록 한다.(완료)
> ~로그인 상태일 때 로그아웃 - 장바구니, 로그아웃 상태일 때 로그인 - 회원가입 버튼이 되도록 한다.~
> ~또한 리액트로 짜놓은 코드를 백엔드로 다시 넣는 작업도 필요하다.~
2. 카카오 api 대신 도서 테이블을 만들어 도서 테이블과 장바구니 테이블 간의 관계가 형성되도록 설계한다.(완료)
> ~도서 테이블 내 도서는 미리 임시 데이터를 만들어놓고, 검색 기능은 도서 테이블 내에서 도서 제목을 "포함하는" 자료 전체를 검색하도록 구현한다.~
3. 장바구니 기능 구현하기(완료)
> ~장바구니 버튼을 누르면 alert 메시지 출력 후, 장바구니 테이블에 cartId, count, userId, bookId를 저장한다.~
> ~이 때 그 도서가 이미 장바구니 내에 존재하면 (쿼리 이용) 장바구니 내에 있는 그 도서의 count를 1 증가한다.~
> ~/cart (장바구니 페이지)의 html, css 부분을 보완한다.~
> ~장바구니에서 수량 변경 가능하도록 한다.~
4. 구매하기 기능 구현하기(완료)
> ~이건 후순위로 미룰 예정, 구현하기가 힘들거 같고 신용카드 테이블, 결제 테이블 등 상당히 복잡해질 것으로 예상.~

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
