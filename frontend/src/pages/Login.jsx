import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo/logo.png';

export default function Login() {
  useEffect(() => {
    // Validação em tempo real
    const form = document.getElementById('tp-login-form');
    if (!form) return;

    const email = document.getElementById('tp-email');
    const cpf = document.getElementById('tp-cpf');
    const username = document.getElementById('tp-username');
    const password = document.getElementById('tp-password');
    const toggle = document.getElementById('tp-toggle-password');
    const submitBtn = document.getElementById('tp-submit');
    const btnText = document.getElementById('tp-btn-text');
    const btnSpinner = document.getElementById('tp-btn-spinner');

    const emailError = document.getElementById('tp-email-error');
    const cpfError = document.getElementById('tp-cpf-error');
    const usernameError = document.getElementById('tp-username-error');
    const passwordError = document.getElementById('tp-password-error');
    const formStatus = document.getElementById('tp-form-status');

    function onlyDigits(s) { return (s||'').replace(/\D/g,''); }
    function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    function validateCPF(value){
      const v = onlyDigits(value);
      if (v.length !== 11) return false;
      if (/^(.)\1+$/.test(v)) return false;
      const calc = (s, factor) => {
        let total = 0;
        for (let i=0;i<s.length;i++) total += Number(s[i]) * (factor - i);
        const mod = (total * 10) % 11; return mod === 10 ? 0 : mod;
      };
      const d1 = calc(v.slice(0,9), 10);
      const d2 = calc(v.slice(0,9) + d1, 11);
      return d1 === Number(v[9]) && d2 === Number(v[10]);
    }

    function showError(el, msg){ el.textContent = msg; el.classList.remove('hidden'); el.previousElementSibling?.setAttribute('aria-invalid','true'); }
    function hideError(el){ el.textContent = ''; el.classList.add('hidden'); el.previousElementSibling?.removeAttribute('aria-invalid'); }

    function validateEmailField(){ const v = email.value.trim(); if (!v){ showError(emailError,'O e-mail é obrigatório.'); return false } if (!isValidEmail(v)){ showError(emailError,'Formato de e-mail inválido.'); return false } hideError(emailError); return true }
    function validateCPFField(){ const v = cpf.value.trim(); if (!v){ hideError(cpfError); return true } if (!validateCPF(v)){ showError(cpfError,'CPF inválido.'); return false } hideError(cpfError); return true }
    function validateUsernameField(){ const v = username.value.trim(); if (!v){ hideError(usernameError); return true } if (v.length < 2){ showError(usernameError,'Usuário muito curto.'); return false } hideError(usernameError); return true }
    function validatePasswordField(){ const v = password.value; if (!v || v.length < 6){ showError(passwordError,'Senha deve ter ao menos 6 caracteres.'); return false } hideError(passwordError); return true }

    function validateForm(){ const a = validateEmailField(); const b = validateCPFField(); const c = validateUsernameField(); const d = validatePasswordField(); const ok = a && b && c && d; submitBtn.disabled = !ok; return ok }

    email.addEventListener('input', ()=>{ validateEmailField(); validateForm(); });
    cpf.addEventListener('input', ()=>{
      const raw = onlyDigits(cpf.value).slice(0,11);
      let f = raw;
      if (raw.length > 3 && raw.length <=6) f = raw.replace(/^(\d{3})(\d+)/,'$1.$2');
      if (raw.length > 6 && raw.length <=9) f = raw.replace(/^(\d{3})(\d{3})(\d+)/,'$1.$2.$3');
      if (raw.length > 9) f = raw.replace(/^(\d{3})(\d{3})(\d{3})(\d+)/,'$1.$2.$3-$4');
      cpf.value = f; validateCPFField(); validateForm();
    });
    username.addEventListener('input', ()=>{ validateUsernameField(); validateForm(); });
    password.addEventListener('input', ()=>{ validatePasswordField(); validateForm(); });

    toggle.addEventListener('click', ()=>{
      const isPwd = password.type === 'password'; password.type = isPwd ? 'text' : 'password'; toggle.setAttribute('aria-pressed', String(isPwd));
      toggle.querySelectorAll('svg').forEach(s => s.classList.toggle('hidden'));
    });

    form.addEventListener('submit', function(e){ e.preventDefault(); formStatus.textContent = ''; formStatus.className = '';
      const ok = validateForm(); if (!ok){ formStatus.textContent = 'Corrija os erros antes de enviar.'; formStatus.className = 'text-sm text-red-600 mt-2'; return }
      submitBtn.disabled = true; btnText.textContent = 'Entrando...'; btnSpinner.classList.remove('hidden'); hideError(emailError); hideError(passwordError);
      setTimeout(()=>{ btnSpinner.classList.add('hidden'); btnText.textContent = 'Entrar'; formStatus.textContent = 'E-mail ou senha incorretos.'; formStatus.className = 'text-sm text-red-600 mt-2'; submitBtn.disabled = !validateForm(); formStatus.setAttribute('role','alert'); }, 1500);
    });

    validateForm();

    // cleanup
    return () => {
      try { email.removeEventListener('input', ()=>{}); } catch(e){}
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-white" style={{backgroundColor: '#faf8f3'}}>
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-12 py-8" style={{backgroundColor: '#3d4e8f'}}>
        <div className="max-w-md mx-auto w-full">

          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1 text-center">Bem-vindo</h1>
          <p className="text-indigo-100 text-sm mb-4 text-center">Entre com suas credenciais para acessar sua conta</p>

          <form id="tp-login-form" noValidate className="space-y-4">
            <div>
              <label htmlFor="tp-email" className="block text-white text-sm font-semibold mb-1">E-mail</label>
              <input id="tp-email" name="email" type="email" inputMode="email" autoComplete="email"
                     className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition" 
                     placeholder="seu@email.com" aria-describedby="tp-email-error" required />
              <p id="tp-email-error" className="mt-1 text-sm text-red-300 hidden" role="alert" aria-live="assertive"></p>
            </div>

            <div>
              <label htmlFor="tp-cpf" className="block text-white text-sm font-semibold mb-2">CPF</label>
              <input id="tp-cpf" name="cpf" type="text" inputMode="numeric" placeholder="000.000.000-00"
                     className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition" 
                     aria-describedby="tp-cpf-error" />
              <p id="tp-cpf-error" className="mt-1 text-sm text-red-300 hidden" role="alert" aria-live="assertive"></p>
            </div>

            <div>
              <label htmlFor="tp-username" className="block text-white text-sm font-semibold mb-1">Usuário ou CPF</label>
              <input id="tp-username" name="username" type="text" autoComplete="username"
                     className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition" 
                     placeholder="seu_usuário" aria-describedby="tp-username-error" />
              <p id="tp-username-error" className="mt-1 text-sm text-red-300 hidden" role="alert" aria-live="assertive"></p>
            </div>

            <div>
              <label htmlFor="tp-password" className="block text-white text-sm font-semibold mb-1">Senha</label>
              <div className="relative">
                <input id="tp-password" name="password" type="password" autoComplete="current-password"
                       className="w-full px-4 py-2 pr-12 bg-white/20 border border-white/30 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition" 
                       placeholder="••••••••" aria-describedby="tp-password-error" required />
                <button type="button" id="tp-toggle-password" aria-label="Mostrar senha" className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-200 hover:text-white transition">
                  <svg id="tp-eye-open" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  <svg id="tp-eye-closed" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.965 9.965 0 012.642-4.206M6.1 6.1l11.8 11.8M19.9 6.1l-1.5 1.5"/></svg>
                </button>
              </div>
              <p id="tp-password-error" className="mt-1 text-sm text-red-300 hidden" role="alert" aria-live="assertive"></p>
            </div>

            <button id="tp-submit" type="submit" className="w-full py-2 px-4 mt-4 font-semibold rounded-lg text-white hover:shadow-lg transition flex items-center justify-center gap-2" style={{backgroundColor: '#2e9e82'}} disabled>
              <svg id="tp-btn-spinner" className="h-5 w-5 text-white hidden animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="4"></circle><path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="4" strokeLinecap="round"></path></svg>
              <span id="tp-btn-text">Entrar</span>
            </button>

            <div id="tp-form-status" aria-live="polite"></div>
          </form>

          <div className="mt-4 pt-4 border-t border-white/20 text-center text-sm">
            <Link to="#" className="text-indigo-200 hover:text-white transition">Esqueci minha senha</Link>
            <p className="text-indigo-200 mt-4">Não tem uma conta? <Link to="/register" className="text-white font-semibold hover:text-teal-200 transition">Criar conta</Link></p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Decoração */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-40 h-40 rounded-full" style={{backgroundColor: '#2e9e82'}}></div>
          <div className="absolute bottom-32 left-20 w-56 h-56 rounded-full" style={{backgroundColor: '#3d4e8f'}}></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full" style={{backgroundColor: '#5aab8c'}}></div>
        </div>
        <div className="relative z-10 text-center px-8 transform -translate-y-12">
          <img src={logo} alt="Logo Pescadores" className="w-[150px] h-[150px] mx-auto" />
          <p className="text-gray-800 font-bold text-lg mt-3">TRÊS PESCADORES STORE</p>
        </div>
      </div>
    </div>
  );
}
