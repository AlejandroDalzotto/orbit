import type { Account } from "../../../types/generated/Account";
import { WalletAccountForm, type WalletAccountFormProps } from "../../wallet-account-form";

export function EditAccountModal(props: WalletAccountFormProps & { account: Account }) {
  return <WalletAccountForm {...props} />;
}
