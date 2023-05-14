# msw_practice

# init
- npx create-react-app  . --template typescript
- npx msw init public -D

# msw init
- mockServiceWorker.js
MSW를 초기화하면, MSW 구성 파일인 msw.config.js와 함께 public 디렉토리에 mockServiceWorker.js 파일이 생성됩니다. mockServiceWorker.js 파일은 MSW의 핵심인 서비스 워커를 등록하고, API 요청에 대한 응답을 설정하는 코드를 포함합니다. 이 파일은 클라이언트 애플리케이션의 코드에서 import하여 사용합니다.

따라서 npx msw init public -D 명령을 실행하면, public 디렉토리 내에 mockServiceWorker.js 파일과 msw.config.js 파일이 생성됩니다. 이후 클라이언트 애플리케이션에서 import하여 사용할 수 있습니다.

추가적으로, public 디렉토리에 있는 index.html 파일 내부에는 리액트 애플리케이션의 루트 요소가 들어가 있습니다. 만약 mockServiceWorker.js 파일에서 document.querySelector('#root')와 같은 코드로 루트 요소를 선택한다면, index.html 파일 내부의 루트 요소 ID가 root인지 확인해보시기 바랍니다.