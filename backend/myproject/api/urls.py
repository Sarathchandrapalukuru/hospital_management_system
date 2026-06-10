from rest_framework.routers import DefaultRouter
from app.api.urls import urlpatterns
from django.urls    import path,include


# router = DefaultRouter()
#posts
# router.registry.extend(post_router.registry)

# initlizing all the stuff again for more control

urlpatterns = [
    # path('',include(router.urls))
    path('',include(urlpatterns)),
    # path('',include(post_router))


]