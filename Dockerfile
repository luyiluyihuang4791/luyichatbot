FROM nginx:alpine

# Copy static website files into Nginx web root
COPY . /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
