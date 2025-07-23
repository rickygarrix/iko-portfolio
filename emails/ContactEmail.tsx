import { Html } from "@react-email/components";
import { Text } from "@react-email/components";

export const ContactEmail = ({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  return (
    <Html>
      <Text>📩 お問い合わせが届きました</Text>
      <Text>------------------------------------</Text>
      <Text>【種別】{subject}</Text>
      <Text>【お名前】{name}</Text>
      <Text>【メールアドレス】{email}</Text>
      <Text>【お問い合わせ内容】</Text>
      <Text>{message}</Text>
      <Text>------------------------------------</Text>
    </Html>
  );
};