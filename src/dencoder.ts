module feign {
	
	 
	export interface Decoder {
		decode(body: any): any
	}
	
	export interface Encoder {
		encode(body: any): any
	}
  
  
	export class JsonEncoder implements Encoder  {
		
		encode(body:any){
			if (body === null || body === undefined)
				return body;
			return JSON.stringify(body);
		}
	}
	
	export class JsonDecoder implements Decoder  {
		
		decode(body:any){
			if (!body || !(typeof(body) === "string"))
				return body;
			try{
				return JSON.parse(body);
			} catch(e){
				throw new Error("Failed to decode json: " + e);
			}
			
		}
	}
	
}