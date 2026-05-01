from rest_framework.renderers import JSONRenderer

class CustomRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context['response'] if renderer_context else None
        
        # En caso de que se haya llamado render internamente sin contexto
        if response is None:
            return super().render(data, accepted_media_type, renderer_context)
            
        status_code = response.status_code
        success = 200 <= status_code < 300
        
        standard_response = {
            'success': success,
            'message': 'Operación exitosa',
            'data': None,
            'errors': None
        }

        if not success:
            standard_response['message'] = 'Hubo un error en la solicitud'
            if isinstance(data, dict):
                # Extraemos y aplanamos el error si viene de drf detail
                if 'detail' in data:
                    standard_response['message'] = data.pop('detail')
                # Los errores de validación suelen venir en diccionarios
                if data:
                    standard_response['errors'] = data
            elif isinstance(data, list):
                standard_response['errors'] = data
            else:
                standard_response['errors'] = str(data)
        else:
            if data is not None:
                if isinstance(data, dict) and 'results' in data and 'count' in data:
                    # Formato de paginación
                    standard_response['data'] = data.pop('results')
                    standard_response['meta'] = {
                        'count': data.get('count'),
                        'next': data.get('next'),
                        'previous': data.get('previous')
                    }
                else:
                    standard_response['data'] = data
        
        return super().render(standard_response, accepted_media_type, renderer_context)
