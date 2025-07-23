import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">確認メールを送信しました</h1>
          <p className="text-gray-700 mb-4">
            登録したメールアドレスに確認リンクを送信しました。<br />
            メールをご確認の上、リンクをクリックして登録を完了してください。
          </p>
          <p className="text-sm text-gray-500">
            メールが届いていない場合は、迷惑メールフォルダもご確認ください。
          </p>
        </div>
      </main>
      <Footer
        locale="ja"
        messages={{
          search: "検索",
          map: "地図",
          contact: "お問い合わせ",
          terms: "利用規約",
          privacy: "プライバシー",
          copyright: "© 2025 Otonavi",
        }}
      />
    </div>
  );
}