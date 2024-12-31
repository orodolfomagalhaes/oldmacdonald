# Estágio de produção
FROM nginx:1.25-alpine

# Instalar dependências necessárias
RUN apk update && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Remover a configuração padrão do nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copiar a configuração personalizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos buildados para o diretório apropriado do nginx
COPY dist /usr/share/nginx/html

# Configurar permissões corretas
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expor a porta 80
EXPOSE 80

# Verificação de saúde
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost/ || exit 1

# Iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]