module feign {
	
	 
	export interface Decoder {
		decode(body: any): any
	}
	
	export interface Encoder {
		encode(body: any): any
	}
  
  
	export class JsonEncoder implements Encoder  {
		
		encode(body:any){
			return JSON.stringify(body);
		}
	}
	
	export class JsonDecoder implements Decoder  {
		
		decode(body:any){
			return JSON.parse(body);
		}
	}
	
}