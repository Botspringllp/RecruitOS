import React from "react";
import PartnerVaultView from "./partner-vault-view";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PartnerVaultPage({ params }: PageProps) {
  const { token } = await params;
  return <PartnerVaultView token={token} />;
}
