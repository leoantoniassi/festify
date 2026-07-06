// ============================================================
// Service: Email — Envio de e-mails via Resend API
// Responsabilidade única: envio de mensagens sem bloqueios SMTP
// ============================================================
const { Resend } = require('resend');

/**
 * Cria a instância do cliente Resend
 * @returns {Resend}
 */
function criarClienteResend() {
  // A chave será buscada da variável de ambiente RESEND_API_KEY
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Envia e-mail de convite para o novo usuário.
 * @param {Object} params
 * @param {string} params.nome - Nome do destinatário
 * @param {string} params.email - E-mail do destinatário
 * @param {string} params.token - Token de convite
 */
async function enviarConvite({ nome, email, token }) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const linkConvite = `${frontendUrl}/definir-senha?token=${token}`;
  const resend = criarClienteResend();

  try {
    console.log(`[Email] Iniciando envio de convite (via Resend) para ${email}...`);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Mais Alegria <onboarding@resend.dev>',
      to: [email],
      subject: '🎉 Você foi convidado para o sistema Mais Alegria!',
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #fdfcf5; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 48px;">🎉</span>
            <h1 style="color: #402d00; font-size: 28px; margin: 16px 0 8px;">Bem-vindo ao Mais Alegria!</h1>
            <p style="color: #6b6348; font-size: 16px;">Olá, <strong>${nome}</strong>! Você foi convidado para acessar o sistema.</p>
          </div>

          <div style="background: #fff; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e8e3d5;">
            <p style="color: #4a4639; margin: 0 0 16px;">
              Clique no botão abaixo para definir sua senha e ativar sua conta.
              Este link expira em <strong>24 horas</strong>.
            </p>
            <div style="text-align: center;">
              <a href="${linkConvite}"
                 style="display: inline-block; background: #FEDC57; color: #402d00; font-weight: 700;
                        font-size: 16px; padding: 14px 32px; border-radius: 999px; text-decoration: none;
                        box-shadow: 0 4px 16px rgba(254,220,87,0.4);">
                Definir Minha Senha
              </a>
            </div>
          </div>

          <p style="color: #9e9585; font-size: 13px; text-align: center; margin-top: 24px;">
            Se você não esperava este convite, pode ignorar este e-mail com segurança.
          </p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    console.log(`[Email] Convite enviado com sucesso! ID: ${data.id}`);
  } catch (error) {
    console.error(`[Email] Erro ao enviar convite para ${email}:`, error);
    throw error;
  }
}

/**
 * Envia e-mail de recuperação de senha para o usuário.
 * @param {Object} params
 * @param {string} params.nome - Nome do destinatário
 * @param {string} params.email - E-mail do destinatário
 * @param {string} params.token - Token de redefinição
 */
async function enviarEmailRecuperacaoSenha({ nome, email, token }) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const linkReset = `${frontendUrl}/redefinir-senha?token=${token}`;
  const resend = criarClienteResend();

  try {
    console.log(`[Email] Iniciando envio de recuperação (via Resend) para ${email}...`);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Mais Alegria <onboarding@resend.dev>',
      to: [email],
      subject: '🔒 Redefinição de senha - Mais Alegria',
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #fdfcf5; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 48px;">🔒</span>
            <h1 style="color: #402d00; font-size: 28px; margin: 16px 0 8px;">Recuperação de Senha</h1>
            <p style="color: #6b6348; font-size: 16px;">Olá, <strong>${nome}</strong>! Recebemos uma solicitação para redefinir sua senha.</p>
          </div>

          <div style="background: #fff; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e8e3d5;">
            <p style="color: #4a4639; margin: 0 0 16px;">
              Clique no botão abaixo para escolher uma nova senha de acesso.
              Por motivos de segurança, este link é válido por apenas <strong>1 hora</strong>.
            </p>
            <div style="text-align: center;">
              <a href="${linkReset}"
                 style="display: inline-block; background: #FEDC57; color: #402d00; font-weight: 700;
                        font-size: 16px; padding: 14px 32px; border-radius: 999px; text-decoration: none;
                        box-shadow: 0 4px 16px rgba(254,220,87,0.4);">
                Redefinir Minha Senha
              </a>
            </div>
          </div>

          <p style="color: #9e9585; font-size: 13px; text-align: center; margin-top: 24px;">
            Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança. Sua senha atual permanecerá inalterada.
          </p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    console.log(`[Email] Recuperação enviada com sucesso! ID: ${data.id}`);
  } catch (error) {
    console.error(`[Email] Erro ao enviar recuperação para ${email}:`, error);
    throw error;
  }
}

module.exports = { enviarConvite, enviarEmailRecuperacaoSenha };
