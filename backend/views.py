from django.views.generic import TemplateView

class FrontendAppView(TemplateView):
    template_name = 'index.html'

    def get(self, request, *args, **kwargs):
        try:
            return super().get(request, *args, **kwargs)
        except:
            from django.http import HttpResponseNotFound
            return HttpResponseNotFound("index.html not found")