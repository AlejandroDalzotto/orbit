import { WalletAccountForm, type WalletAccountFormProps } from "../../wallet-account-form";

export function AddAccountModal(props: Omit<WalletAccountFormProps, "account">) {
  return <WalletAccountForm {...props} />;
}
